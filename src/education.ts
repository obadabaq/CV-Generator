import { Paragraph, TextRun } from "docx";
import { Title } from "./utils";
import { EducationType } from "./cv";

export const educationSectionBuilder = (education: EducationType[]) => [
  Title("Education"),
  new Paragraph({
    children: [
      new TextRun({
        break: 1,
        text: `${education[0].degree} in ${education[0].specialization}`,
      }),
    ],
  }),
  new Paragraph({
    text: education[0].university,
  }),
  new Paragraph({
    text: `Graduation Year: ${education[0].endDate.split(" ")[1]}`,
  }),
  new Paragraph({
    text: `Grade: ${education[0].grade}`,
  }),
];
