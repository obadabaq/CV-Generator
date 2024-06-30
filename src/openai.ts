import "dotenv/config";
import Openai from "openai";
import fs from "fs";

export const openai = new Openai({ apiKey: process.env.OPEN_AI_KEY as string });

export const aiModel = process.env.OPEN_AI_MODEL as string;

export const assistant = fs.readFileSync("./src/cvs.json").toString();
