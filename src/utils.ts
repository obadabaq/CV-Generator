import select, { Separator } from "@inquirer/select";
import { Paragraph, TextRun } from "docx";

export const consolePicker = async (
  choices: string[],
  title: string,
  noneOption = true,
  clearConsole = true
) => {
  const noneKey = "None of the above";
  if (clearConsole) console.clear();
  const result = await select({
    message: `Select your favorite ${title}`,
    choices: [
      ...choices.map((choice) => ({
        value: choice,
      })),
      ...(noneOption
        ? [
            new Separator(),
            {
              value: noneKey,
            },
          ]
        : []),
    ],
    pageSize: 1000,
  });
  if (result === noneKey) return null;
  return result;
};

export const Title = (text: string, breakBefore = 1) =>
  new Paragraph({
    alignment: "center",
    children: [
      new TextRun({
        text,
        allCaps: true,
        bold: true,
        break: breakBefore,
        size: "13pt",
      }),
    ],
    border: BorderDivider(8),
  });

export const toTitle = (str: string) => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const BorderDivider: (size?: number) => any = (size = 2) => ({
  bottom: {
    style: "single",
    size,
    color: "auto",
    space: 2,
  },
  top: {
    style: "none",
  },
  left: {
    style: "none",
  },
  right: {
    style: "none",
  },
});

export const objectStringify = (obj: any, keys: string[]) => {
  let str = "";
  for (let key of keys) {
    str += `${toTitle(key)}\n`;
    if (typeof obj[key] === "string") {
      str += `${obj[key]}\n`;
    } else if (Array.isArray(obj[key])) {
      for (let item of obj[key]) {
        if (typeof item === "string") str += `${item}\n`;
        else str += objectStringify(item, Object.keys(item));
      }
    } else {
      const subKeys = Object.keys(obj[key]);
      for (let subKey of subKeys) {
        str += `${toTitle(subKey)} : ${obj[key][subKey]}\n`;
      }
    }
  }
  return str;
};

export const campaignGetParam = (company_name: string) =>
  `&utm_campaign=${encodeURIComponent(
    company_name.split(" ").join("-").toLowerCase()
  )}`;

const monthsNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const handleDate = (date: string) => {
  const d = new Date(date);
  return `${monthsNames[d.getMonth()]}, ${d.getFullYear()}`;
};
