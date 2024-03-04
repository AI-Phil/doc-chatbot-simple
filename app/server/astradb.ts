'use server';

import { writeFile, mkdtemp } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

import { OpenAIEmbeddings } from "@langchain/openai";
import {
  AstraDBVectorStore,
  AstraLibArgs,
} from "@langchain/community/vectorstores/astradb";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

const astraConfig: AstraLibArgs = {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN as string,
  endpoint: process.env.ASTRA_DB_ENDPOINT as string,
  namespace: process.env.ASTRA_DB_NAMESPACE ?? "default_keyspace" as string,  
  collection: process.env.ASTRA_DB_COLLECTION ?? "dbs_data_default" as string,
  collectionOptions: {
    vector: {
      dimension: 1536,
      metric: "dot_product",
    },
  },
};

export async function saveToVectorCollection(buffer: Buffer, docId?: string, metadata?: Record<string, any>): Promise<string[]> {
    const documentId = docId || uuidv4();

    const vectorStore = await AstraDBVectorStore.fromExistingIndex(
        new OpenAIEmbeddings(),
        astraConfig
        );

    const tempDir = await mkdtemp(join(os.tmpdir(), `${astraConfig.collection}-`));
    const filePath = join(tempDir, 'uploadedFile');
    await writeFile(filePath, buffer);      
    const loader = new PDFLoader(filePath, {
        splitPages: false,
        });
          
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
    let splitDocs = await textSplitter.splitDocuments(docs);

    // Astra identifiers
    const options = splitDocs.map((_, index) => `${documentId}-${index}`);

    const documentsWithMetadata = splitDocs.map((doc, index) => new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...(doc.metadata || {}),
          ...(metadata || {}),
          docId: documentId,
        }
      }));
           
    await vectorStore.addDocuments(documentsWithMetadata, options);

    console.log(`File saved to endpoint ${astraConfig.endpoint} and collection ${astraConfig.collection}`);

    return options;
}
