# **PRD-004: Personal Document Storage \+ RAG Pipeline**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 0 — Foundation |
| **Dependencies** | PRD-001 (Auth) |

# **1\. Overview**

This PRD defines the personal document storage system and RAG (Retrieval-Augmented Generation) pipeline that enables users to upload, organize, and leverage their documents for AI-powered assistance. The system extracts text, generates embeddings, and provides semantic search capabilities that power the personal AI agent.

## **1.1 Purpose**

Enable users to securely store personal financial documents (pay stubs, tax returns, pre-approval letters) and have the AI agent reference this information when answering questions or providing guidance. This creates a personalized experience where the agent understands the user's specific financial situation.

## **1.2 Scope: Personal vs Group Documents**

This PRD covers personal document storage only. Group document storage (co-ownership agreements, shared financials) is covered in PRD-008.

| Aspect | Personal (PRD-004) | Group (PRD-008) |
| :---- | :---- | :---- |
| Ownership | Single user | Group members |
| Access | Owner only | All group members |
| Agent context | Personal agent only | Group agent |
| Sharing | Opt-in to group (temporary) | Inherently shared |
| Example docs | Pay stubs, tax returns, credit report | TIC agreement, deed, insurance |

## **1.3 System Architecture Overview**

Document Upload Flow:

┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐  
│  Upload  │────▶│ Supabase │────▶│  Background  │────▶│ pgvector │  
│   UI     │     │ Storage  │     │    Job       │     │  Store   │  
└──────────┘     └──────────┘     └──────────────┘     └──────────┘  
                      │                  │  
                      ▼                  ▼  
                 ┌──────────┐     ┌──────────────┐  
                 │ Document │     │    Text      │  
                 │  Record  │     │  Extraction  │  
                 └──────────┘     └──────────────┘

RAG Query Flow:

┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐  
│  User    │────▶│  Embed   │────▶│   Vector     │────▶│  Agent   │  
│  Query   │     │  Query   │     │   Search     │     │ Context  │  
└──────────┘     └──────────┘     └──────────────┘     └──────────┘

## **1.4 Success Criteria**

* Document upload completes in under 5 seconds for files \<10MB  
* Text extraction completes within 60 seconds of upload  
* Embedding generation completes within 120 seconds of extraction  
* RAG retrieval returns relevant chunks in under 500ms  
* Zero unauthorized document access (RLS enforced)  
* User satisfaction with agent document references ≥4/5

# **2\. User Stories**

* **US-1 Document Upload:** As a user, I want to upload my financial documents so that the AI can reference them when helping me assess my readiness.  
* **US-2 Document Organization:** As a user, I want to categorize my documents so that I can easily find them later.  
* **US-3 Document Viewing:** As a user, I want to view my uploaded documents so that I can verify the content.  
* **US-4 AI Context:** As a user, I want the AI to reference my documents when answering questions so that responses are personalized to my situation.  
* **US-5 Document Deletion:** As a user, I want to delete my documents so that sensitive information is removed.  
* **US-6 Processing Status:** As a user, I want to see the processing status of my documents so that I know when they're ready for AI use.  
* **US-7 Temporary Sharing:** As a user joining a group, I want to optionally share specific documents with my co-buyers for verification.

# **3\. Supported Document Types**

## **3.1 File Formats**

| Format | Extension | Extraction Method | Notes |
| :---- | :---- | :---- | :---- |
| PDF | .pdf | pdf-parse / pdf.js | Primary format, OCR for scanned docs |
| Word | .docx | mammoth | Preserves structure |
| Images | .png .jpg | Tesseract OCR | For scanned documents |
| Plain Text | .txt | Direct read | No extraction needed |
| Spreadsheet | .xlsx .csv | xlsx / csv-parse | Convert to structured text |

## **3.2 Document Categories**

| Category | Example Documents | Icon |
| :---- | :---- | :---- |
| income | Pay stubs, W-2s, 1099s, employment letters | 💰 |
| tax | Tax returns, 1040s, state returns | 📋 |
| credit | Credit reports, credit score summaries | 📊 |
| banking | Bank statements, asset verification | 🏦 |
| preapproval | Pre-approval letters, loan estimates | ✅ |
| identity | ID, passport, SSN card (encrypted) | 🪪 |
| other | Miscellaneous documents | 📄 |

## **3.3 File Constraints**

* **Maximum file size:** 25MB per file  
* **Maximum storage per user:** 500MB (MVP), expandable  
* **Maximum files per user:** 100 documents  
* **Filename restrictions:** Alphanumeric \+ spaces \+ hyphens, max 255 chars

# **4\. Functional Requirements**

## **4.1 Document Upload**

1. System shall accept file uploads via drag-and-drop or file picker  
2. System shall validate file type, size, and name before upload  
3. System shall display upload progress with percentage  
4. System shall allow batch upload of multiple files  
5. System shall prompt for category selection (or auto-detect)  
6. System shall generate unique storage key with user namespace

## **4.2 Document Storage**

1. System shall store files in Supabase Storage with RLS policies  
2. System shall encrypt files at rest (AES-256)  
3. System shall create document metadata record in database  
4. System shall generate signed URLs for secure access (15 min expiry)  
5. System shall support document versioning (replace preserves history)

## **4.3 Text Extraction**

1. System shall queue extraction job on upload completion  
2. System shall extract text using format-appropriate library  
3. System shall apply OCR for image-based PDFs and images  
4. System shall store extracted text in document record  
5. System shall update embedding\_status to 'extracted' on success  
6. System shall mark 'failed' with error details on extraction failure

## **4.4 Embedding Generation**

1. System shall chunk extracted text (512 tokens, 50 token overlap)  
2. System shall generate embeddings via OpenAI text-embedding-3-small  
3. System shall store embeddings in pgvector with document reference  
4. System shall store chunk metadata (position, page number)  
5. System shall update embedding\_status to 'indexed' on success  
6. System shall re-embed on document update/replace

## **4.5 RAG Retrieval**

1. System shall embed user query using same embedding model  
2. System shall perform cosine similarity search on user's documents only  
3. System shall return top-k chunks (default k=5) above similarity threshold  
4. System shall include document metadata (name, category) with chunks  
5. System shall support category filtering in retrieval

# **5\. Data Model**

## **5.1 Documents Table (public.documents)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| user\_id | UUID FK | Owner (for personal docs) |
| group\_id | UUID FK | Null for personal docs |
| name | VARCHAR(500) | Original filename |
| category | VARCHAR(100) | Document category |
| mime\_type | VARCHAR(100) | File MIME type |
| size\_bytes | BIGINT | File size |
| storage\_key | VARCHAR(500) | Supabase Storage path |
| uploaded\_by | UUID FK | Uploader user ID |
| version | INTEGER | Document version |
| parent\_doc\_id | UUID FK | Previous version reference |
| embedding\_status | VARCHAR(50) | pending, extracting, extracted, indexing, indexed, failed |
| extracted\_text | TEXT | Full extracted text |
| extraction\_error | TEXT | Error message if failed |
| page\_count | INTEGER | Number of pages (if applicable) |
| metadata | JSONB | Additional metadata |
| created\_at | TIMESTAMPTZ | Upload timestamp |
| updated\_at | TIMESTAMPTZ | Last update |

## **5.2 Document Chunks Table (public.document\_chunks)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| document\_id | UUID FK | Parent document |
| user\_id | UUID FK | Owner (denormalized for RLS) |
| chunk\_index | INTEGER | Position in document |
| content | TEXT | Chunk text content |
| embedding | VECTOR(1536) | OpenAI embedding |
| token\_count | INTEGER | Tokens in chunk |
| page\_number | INTEGER | Source page (if applicable) |
| metadata | JSONB | Chunk-level metadata |
| created\_at | TIMESTAMPTZ | Created timestamp |

## **5.3 Document Shares Table (public.document\_shares)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID PK | Primary key |
| document\_id | UUID FK | Shared document |
| shared\_with\_group | UUID FK | Target group |
| shared\_by | UUID FK | User who shared |
| expires\_at | TIMESTAMPTZ | Auto-revoke time |
| created\_at | TIMESTAMPTZ | Share timestamp |

## **5.4 pgvector Index**

\-- Enable pgvector extension

CREATE EXTENSION IF NOT EXISTS vector;

\-- Create HNSW index for fast similarity search  
CREATE INDEX idx\_document\_chunks\_embedding  
ON document\_chunks  
USING hnsw (embedding vector\_cosine\_ops)  
WITH (m \= 16, ef\_construction \= 64);

\-- Index for filtering by user  
CREATE INDEX idx\_document\_chunks\_user  
ON document\_chunks(user\_id);

# **6\. Processing Pipeline**

## **6.1 Pipeline Stages**

| Stage | Status | Action | Trigger |
| :---- | :---- | :---- | :---- |
| 1\. Upload | pending | File stored, record created | User upload |
| 2\. Extract | extracting | Text extraction running | Background job |
| 3\. Extracted | extracted | Text saved, ready for embedding | Extraction complete |
| 4\. Index | indexing | Chunking and embedding | Background job |
| 5\. Ready | indexed | Available for RAG | Indexing complete |
| Error | failed | Error logged, retry available | Any stage failure |

## **6.2 Background Job Implementation**

Jobs processed via Supabase Edge Functions with Inngest for orchestration.

// Inngest function definition

export const processDocument \= inngest.createFunction(  
  { id: "process-document" },  
  { event: "document/uploaded" },  
  async ({ event, step }) \=\> {  
    const { documentId } \= event.data;  
      
    // Step 1: Extract text  
    const text \= await step.run("extract-text", async () \=\> {  
      return await extractText(documentId);  
    });  
      
    // Step 2: Chunk and embed  
    await step.run("generate-embeddings", async () \=\> {  
      const chunks \= chunkText(text, 512, 50);  
      return await embedChunks(documentId, chunks);  
    });  
  }  
);

## **6.3 Text Extraction by Format**

| Format | Library | Notes |
| :---- | :---- | :---- |
| PDF (text) | pdf-parse | Fast, preserves layout |
| PDF (scanned) | tesseract.js | OCR, slower, requires image extraction |
| DOCX | mammoth | HTML output, strip tags |
| XLSX | xlsx | Convert to CSV-like text |
| Images | tesseract.js | OCR with preprocessing |
| TXT | Native | Direct read, UTF-8 |

## **6.4 Chunking Strategy**

* **Chunk size:** 512 tokens (optimal for embedding model)  
* **Overlap:** 50 tokens (preserves context across boundaries)  
* **Separator priority:** Paragraph \> Sentence \> Word  
* **Metadata preserved:** Page number, section header (if detectable)

# **7\. RAG Implementation**

## **7.1 Query Flow**

// RAG retrieval function

async function retrieveContext(  
  userId: string,  
  query: string,  
  options?: { categories?: string\[\], topK?: number }  
): Promise\<RetrievedChunk\[\]\> {  
  const { categories, topK \= 5 } \= options ?? {};  
    
  // 1\. Embed the query  
  const queryEmbedding \= await embed(query);  
    
  // 2\. Search user's documents only (RLS enforced)  
  const results \= await supabase.rpc("match\_document\_chunks", {  
    query\_embedding: queryEmbedding,  
    match\_count: topK,  
    filter\_user\_id: userId,  
    filter\_categories: categories,  
    similarity\_threshold: 0.7  
  });  
    
  return results.map(r \=\> ({  
    content: r.content,  
    documentName: r.document\_name,  
    category: r.category,  
    similarity: r.similarity,  
    pageNumber: r.page\_number  
  }));  
}

## **7.2 Similarity Search Function**

\-- Supabase RPC function for vector search

CREATE OR REPLACE FUNCTION match\_document\_chunks(  
  query\_embedding VECTOR(1536),  
  match\_count INT DEFAULT 5,  
  filter\_user\_id UUID DEFAULT NULL,  
  filter\_categories TEXT\[\] DEFAULT NULL,  
  similarity\_threshold FLOAT DEFAULT 0.7  
)  
RETURNS TABLE (  
  id UUID,  
  content TEXT,  
  document\_id UUID,  
  document\_name TEXT,  
  category TEXT,  
  similarity FLOAT,  
  page\_number INT  
)  
LANGUAGE plpgsql  
AS $$  
BEGIN  
  RETURN QUERY  
  SELECT  
    dc.id,  
    dc.content,  
    dc.document\_id,  
    d.name AS document\_name,  
    d.category,  
    1 \- (dc.embedding \<=\> query\_embedding) AS similarity,  
    dc.page\_number  
  FROM document\_chunks dc  
  JOIN documents d ON d.id \= dc.document\_id  
  WHERE dc.user\_id \= filter\_user\_id  
    AND (filter\_categories IS NULL  
         OR d.category \= ANY(filter\_categories))  
    AND 1 \- (dc.embedding \<=\> query\_embedding)  
        \> similarity\_threshold  
  ORDER BY dc.embedding \<=\> query\_embedding  
  LIMIT match\_count;  
END;  
$$;

## **7.3 Context Injection for Agent**

Retrieved chunks are formatted and injected into the agent's context:

\<relevant\_documents\>

  \<document name="2023\_W2.pdf" category="income"\>  
    \[Page 1\] Total wages: $85,000.00. Federal tax withheld: $12,750...  
  \</document\>  
  \<document name="PreApproval\_Letter.pdf" category="preapproval"\>  
    \[Page 1\] You are pre-approved for a loan up to $450,000...  
  \</document\>  
\</relevant\_documents\>

# **8\. Security & Access Control**

## **8.1 Row Level Security Policies**

\-- Documents: owner access only

CREATE POLICY documents\_owner\_access ON documents  
FOR ALL USING (  
  user\_id \= auth.uid()  
  OR id IN (  
    SELECT document\_id FROM document\_shares  
    WHERE shared\_with\_group IN (  
      SELECT group\_id FROM memberships  
      WHERE user\_id \= auth.uid() AND status \= 'active'  
    )  
    AND (expires\_at IS NULL OR expires\_at \> NOW())  
  )  
);

\-- Chunks: same policy via user\_id denormalization  
CREATE POLICY chunks\_owner\_access ON document\_chunks  
FOR ALL USING (user\_id \= auth.uid());

## **8.2 Storage Security**

* Files stored in user-namespaced paths: /users/{user\_id}/documents/{document\_id}  
* Supabase Storage policies mirror database RLS  
* Signed URLs expire after 15 minutes  
* Direct bucket access disabled (API only)  
* Encryption at rest via Supabase (AES-256)

## **8.3 Sensitive Document Handling**

* Identity documents (SSN, passport) flagged as sensitive  
* Sensitive docs excluded from RAG by default (opt-in)  
* PII detection in extracted text (SSN patterns, etc.)  
* Audit log entries for all document access

# **9\. API Endpoints**

## **9.1 Document Management**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/documents | List user's documents with filtering/pagination |
| GET | /api/documents/:id | Get document metadata |
| GET | /api/documents/:id/url | Get signed download URL |
| POST | /api/documents/upload | Upload new document (multipart) |
| PATCH | /api/documents/:id | Update metadata (name, category) |
| DELETE | /api/documents/:id | Delete document and all chunks |
| POST | /api/documents/:id/retry | Retry failed processing |

## **9.2 Document Sharing**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/documents/:id/share | Share document with group (with expiry) |
| DELETE | /api/documents/:id/share/:groupId | Revoke share |
| GET | /api/documents/:id/shares | List active shares for document |

## **9.3 RAG**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/rag/query | Retrieve relevant chunks for query |
| GET | /api/documents/:id/chunks | List chunks for document (debug) |

# **10\. UI/UX Requirements**

## **10.1 Document Library**

* **Grid/List toggle:** Card view (default) or table view  
* **Category filter:** Sidebar or dropdown to filter by category  
* **Search:** Search by document name  
* **Sort:** By date, name, category  
* **Status badges:** Processing, Ready, Failed with colors

## **10.2 Upload Experience**

* **Drag-and-drop zone:** Large drop area with visual feedback  
* **File picker:** Fallback button for file selection  
* **Batch upload:** Queue multiple files with individual progress  
* **Category prompt:** Suggest category based on filename, allow override  
* **Validation feedback:** Inline errors for invalid files

## **10.3 Processing Status**

* **Pending:** Gray badge, spinner icon  
* **Processing:** Blue badge, animated progress  
* **Ready:** Green badge, checkmark  
* **Failed:** Red badge, retry button  
* **Tooltip:** Show detailed status on hover

## **10.4 Document Preview**

* **PDF viewer:** In-app PDF rendering (react-pdf)  
* **Image viewer:** Native image display with zoom  
* **Other formats:** Download link, no preview  
* **Extracted text tab:** Show extracted text for verification

# **11\. Cost Estimates**

## **11.1 Embedding Costs (OpenAI text-embedding-3-small)**

| Scenario | Docs/User | Tokens/Doc | Users | Monthly |
| :---- | :---- | :---- | :---- | :---- |
| Alpha | 10 | 5,000 | 50 | $0.50 |
| Beta | 20 | 5,000 | 500 | $10 |
| Launch | 30 | 5,000 | 5,000 | $150 |

*Note: Pricing at $0.00002/1K tokens. Query embeddings add \~10% overhead.*

## **11.2 Storage Costs (Supabase)**

| Tier | Included | Overage | Est. Monthly |
| :---- | :---- | :---- | :---- |
| Free | 1GB | $0.021/GB | $0 (alpha) |
| Pro | 100GB | $0.021/GB | $25 base |

# **12\. Dependencies**

| Package | Version | Purpose |
| :---- | :---- | :---- |
| pdf-parse | ^1.1.1 | PDF text extraction |
| mammoth | ^1.6.0 | DOCX to HTML/text |
| tesseract.js | ^5.0.0 | OCR for images/scanned PDFs |
| xlsx | ^0.18.5 | Excel parsing |
| openai | ^4.20.0 | Embedding generation |
| inngest | ^3.0.0 | Background job orchestration |
| react-pdf | ^7.5.0 | PDF preview in browser |
| react-dropzone | ^14.2.0 | Drag-and-drop uploads |

# **13\. Out of Scope (MVP)**

* Auto-categorization via AI — manual selection for MVP  
* Document summarization — full text only  
* OCR language support beyond English  
* Real-time collaborative document editing  
* E-signature integration  
* Document comparison/diff view

# **14\. Open Questions**

1. Should we offer auto-categorization via Claude as a stretch goal?  
2. Document retention policy — how long to keep deleted docs for recovery?  
3. Should extracted text be editable by users to fix OCR errors?  
4. Chunk size optimization — should we experiment with different sizes?

# **15\. Acceptance Criteria**

| Criterion | Method | Target |
| :---- | :---- | :---- |
| PDF upload completes successfully | Manual test | Pass |
| DOCX upload completes successfully | Manual test | Pass |
| Image (PNG/JPG) with OCR completes | Manual test | Pass |
| Text extraction produces readable output | Manual review | Pass |
| Embeddings generated and stored | DB query | Pass |
| RAG retrieval returns relevant chunks | Manual test | Pass |
| RLS prevents unauthorized access | Security test | Pass |
| Document deletion removes all chunks | DB query | Pass |
| Failed processing shows retry option | Manual test | Pass |
| Signed URLs expire after 15 min | API test | Pass |
| Upload progress displays correctly | Manual test | Pass |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

