/**
 * Node Imports
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

export const splitTextIntoChunks = async (
    text : string,
    chunkSize : number = 1000, 
    chunkOverlap: number = 200 
)=>{
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
    const chunks = await splitter.splitText(text)
    return chunks
}