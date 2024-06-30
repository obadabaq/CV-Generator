import fs from "fs";
import input from "@inquirer/input";
import editor from "@inquirer/editor";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { exec } from "child_process";
import { consolePicker, objectStringify } from "./utils";
import { experienceSectionBuilder } from "./experience";
import { summarySectionBuilder } from "./summary";
import { headerSectionBuilder } from "./header";
import { projectSectionBuilder } from "./projects";
import { educationSectionBuilder } from "./education";
import { coverLetterGenerator } from "./cover_letter";
import { questionsAnswerer } from "./questions";
import { skillsSectionBuilder } from "./skills";
import { fetchCV } from "./cv";
import { aiFoolerBuilder } from "./ai_fooler";

const generateCV = async () => {
  const meta = await fetchCV();
  console.clear();
  const company_name = await input({
    message: "Enter the company name: ",
  });
  const isTestRun = company_name === "test";
  console.clear();
  const job_description = isTestRun
    ? ""
    : await editor({
      message: "Paste the job description: ",
    });

  const cv = objectStringify(meta, [
    "first_name",
    "last_name",
    "positions",
    "summary",
    "hard_skills",
    "soft_skills",
    "top_skills",
    "address",
    "education",
    "experiences",
    "projects",
    "languages",
  ]);

  const children = [];

  // Header
  children.push(
    ...(await headerSectionBuilder(
      meta,
      company_name,
      cv,
      job_description,
      "cv",
      isTestRun
    ))
  );

  // Summary
  children.push(
    ...(await summarySectionBuilder(
      meta.summary,
      cv,
      job_description,
      isTestRun
    ))
  );

  // Experience Section
  children.push(
    ...(await experienceSectionBuilder(
      meta.experiences,
      job_description,
      isTestRun
    ))
  );

  // Skills Section
  children.push(
    ...(await skillsSectionBuilder(cv, job_description, meta, isTestRun))
  );

  children.push(...aiFoolerBuilder());

  // Projects Section
  children.push(...projectSectionBuilder(meta, company_name));

  // Education Section
  children.push(...educationSectionBuilder(meta.education));

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  // Date in DD-MM-YYYY format
  const date = new Date()
    .toLocaleDateString("en-GB")
    .split("/")
    .reverse()
    .join("-");

  Packer.toBuffer(doc).then(async (buffer) => {
    const path = `./cvs/${meta.first_name}_${meta.last_name}_${company_name}_${date}.docx`;
    fs.writeFileSync(path, buffer);
    exec(`start "" "${path}"`);
  });

  if (isTestRun) return;

  const needsCoverLetter = await consolePicker(
    ["Yes", "No"],
    "Cover Letter",
    false
  );

  if (needsCoverLetter === "Yes") {
    const coverLetter = await coverLetterGenerator(
      meta,
      company_name,
      cv,
      job_description
    );

    const coverDoc = new Document({
      sections: [
        {
          children: [
            ...(await headerSectionBuilder(
              meta,
              company_name,
              cv,
              job_description,
              "cv",
              isTestRun
            )),
            new Paragraph({
              children: coverLetter
                .split("\n")
                .map(
                  (line, i) =>
                    new TextRun({ text: line, break: i === 0 ? 2 : 1 })
                ),
            }),
          ],
        },
      ],
    });
    Packer.toBuffer(coverDoc).then(async (buffer) => {
      const path = `./cvs/${meta.first_name}_${meta.last_name}_${company_name}_cover_letter.docx`;
      fs.writeFileSync(path, buffer);
      exec(`start "" "${path}"`);
    });
  }
  
  await questionsAnswerer(meta, company_name, cv, job_description);
};

generateCV();
