import { input } from "@inquirer/prompts";
import { aiModel, openai } from "./openai";
import { consolePicker } from "./utils";
import fs from "fs";
import { exec } from "child_process";

const generateAiQuestionAnswer = async (
  cv: string,
  job_description: string,
  question: string
) => {
  const result = await openai.chat.completions.create({
    model: aiModel,
    messages: [
      {
        role: "system",
        content:
          "You are a CV writer. You will be given a CV and a Job Description and a question that the company is asking. Answer a the question that the company is asking without anything else to submit it to the company with the application. Keep it short and to the point. The output should be a plain text to be placed inside a docx file.",
      },
      {
        role: "user",
        content: `CV
              ${cv}
              Job Description
              ${job_description}
              Question
              ${question}
            `,
      },
    ],
  });
  return result.choices[0].message.content?.trim() as string;
};

const generateQuestionAnswer = async (
  cv: string,
  job_description: string,
  question: string
) => {
  const answers: string[] = [];
  answers.unshift(await generateAiQuestionAnswer(cv, job_description, question));
  let answer = await consolePicker(answers, "Answer");
  while (!answer) {
    answers.unshift(await generateAiQuestionAnswer(cv, job_description, question));
    answer = await consolePicker(answers, "Answer");
  }
  return answer as string;
};

export const questionsAnswerer = async (
  meta: {
    first_name: string;
    last_name: string;
  },
  company_name: string,
  cv: string,
  job_description: string
) => {
  let moreQuestions = await consolePicker(
    ["Yes", "No"],
    "More Questions",
    false
  );

  const questions = [];
  while (moreQuestions === "Yes") {
    const question = await input({
      message: "Ask a question: ",
    });

    const answer = await generateQuestionAnswer(cv, job_description, question);
    questions.push({ question, answer });
    moreQuestions = await consolePicker(["Yes", "No"], "More Questions", false);
  }
  if (questions.length > 0) {
    const path = `./cvs/${meta.first_name}_${meta.last_name}_${company_name}_questions.txt`;
    fs.writeFileSync(
      path,
      questions.map((item) => `${item.question}\n${item.answer}`).join("\n\n")
    );
    exec(`start "" "${path}"`);
  }
};
