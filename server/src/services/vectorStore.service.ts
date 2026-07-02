/**
 * Node Imports
 */
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
/**
 * Other Imports
 */
import { embeddings, env, getMongoDBClient } from "../config"



export const vectorStore = async ()=>{

    const client = await getMongoDBClient()
    const collection = client.db(env.DB_NAME).collection(env.COLLECTION_NAME)
    return new MongoDBAtlasVectorSearch(
        embeddings,
        {
            collection: collection as any,
            indexName : env.INDEX_NAME,
            textKey : 'text',
            embeddingKey : "embedding"
        }
    )
}