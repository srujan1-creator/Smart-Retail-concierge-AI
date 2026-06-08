import math
import sqlite3
import re
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'aura_concierge.db')

STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
    'show', 'me', 'find', 'something', 'looking', 'want', 'need', 'like'
}

def tokenize(text):
    if not text:
        return []
    # Lowercase and remove punctuation
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    tokens = text.split()
    # Filter stopwords and short terms (length < 2)
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]

class ProductVectorSearch:
    def __init__(self):
        self.products = []
        self.vocab = set()
        self.doc_vectors = []
        self.idf = {}
        self.load_products()

    def load_products(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, description, price, image_url, category, colors, sizes, tags FROM products")
        rows = cursor.fetchall()
        
        self.products = []
        documents = []
        
        for row in rows:
            product = dict(row)
            self.products.append(product)
            
            # The document text is a combination of name, description, category, and tags
            # We weight the name and tags more heavily by repeating them
            doc_text = f"{product['name']} {product['name']} {product['category']} {product['tags']} {product['tags']} {product['description']}"
            tokens = tokenize(doc_text)
            documents.append((product['id'], tokens))
            self.vocab.update(tokens)
            
        conn.close()
        
        # Calculate IDF
        num_docs = len(documents)
        doc_frequencies = {}
        for token in self.vocab:
            doc_frequencies[token] = sum(1 for _, tokens in documents if token in tokens)
            
        self.idf = {}
        for token, df in doc_frequencies.items():
            # Standard smooth IDF formula
            self.idf[token] = math.log((1 + num_docs) / (1 + df)) + 1
            
        # Build TF-IDF vector for each document
        self.doc_vectors = {}
        for doc_id, tokens in documents:
            # Term Frequency (TF)
            tf = {}
            for token in tokens:
                tf[token] = tf.get(token, 0) + 1
                
            # Normalize TF by document length
            doc_len = len(tokens)
            tf_norm = {token: count / doc_len for token, count in tf.items()}
            
            # TF-IDF Vector
            vector = {}
            for token, tf_val in tf_norm.items():
                vector[token] = tf_val * self.idf[token]
                
            self.doc_vectors[doc_id] = vector

    def cosine_similarity(self, vec1, vec2):
        # Find intersection of keys for dot product
        intersection = set(vec1.keys()).intersection(set(vec2.keys()))
        if not intersection:
            return 0.0
            
        dot_product = sum(vec1[x] * vec2[x] for x in intersection)
        
        sum1 = sum(val**2 for val in vec1.values())
        sum2 = sum(val**2 for val in vec2.values())
        
        magnitude1 = math.sqrt(sum1)
        magnitude2 = math.sqrt(sum2)
        
        if magnitude1 == 0.0 or magnitude2 == 0.0:
            return 0.0
            
        return dot_product / (magnitude1 * magnitude2)

    def search(self, query_text, limit=3):
        query_tokens = tokenize(query_text)
        if not query_tokens:
            # Return top stock or random products if query is empty or only stopwords
            return [(p, 0.0) for p in self.products[:limit]]
            
        # Compute query vector (TF weight * IDF)
        query_tf = {}
        for token in query_tokens:
            if token in self.vocab:
                query_tf[token] = query_tf.get(token, 0) + 1
                
        if not query_tf:
            # No matching words in vocabulary
            return [(p, 0.0) for p in self.products[:limit]]
            
        query_len = len(query_tokens)
        query_vector = {token: (count / query_len) * self.idf[token] for token, count in query_tf.items()}
        
        # Calculate similarity with all products
        results = []
        for doc_id, doc_vector in self.doc_vectors.items():
            sim = self.cosine_similarity(query_vector, doc_vector)
            product = next(p for p in self.products if p['id'] == doc_id)
            results.append((product, sim))
            
        # Sort by similarity score descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]

# Quick test if run directly
if __name__ == '__main__':
    searcher = ProductVectorSearch()
    print("Testing vector search...")
    
    # Query 1: casual mixer outfit
    print("\nQuery: 'something casual but formal enough for a tech networking mixer'")
    results = searcher.search("something casual but formal enough for a tech networking mixer")
    for prod, score in results:
        print(f"- {prod['name']} (Score: {score:.4f}, Category: {prod['category']})")
        
    # Query 2: black shoes
    print("\nQuery: 'black boots'")
    results = searcher.search("black boots")
    for prod, score in results:
        print(f"- {prod['name']} (Score: {score:.4f})")
