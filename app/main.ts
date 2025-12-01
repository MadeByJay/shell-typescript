import path from "path";
import fs from "fs";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

type CommandByKey = {
  [key: string]: string;
};

type CallbackByKey = {
  [key: string]: Function;
};

type CommandDictionary = CommandByKey | CallbackByKey;

const commandMap: CommandDictionary = {
  ["exit"]: handleExit,
  ["echo"]: (args: string[]) => handleEcho(args),
  ["type"]: (args: string[]) => handleType(args),
};

const commandDictionary: CommandDictionary = {
  ["exit"]: "exit",
  ["echo"]: "echo",
  ["type"]: "type",
} as const;

rl.setPrompt("$ ");
rl.prompt();

rl.on("line", (line) => {
  const stringArray = line.trim().split(" ");
  const [commandString, ...commandArgs] = stringArray;
  const command = commandDictionary[commandString];

  if (!command) {
    console.log(`${commandString}: command not found`);
  } else if (command) {
    const callback = commandMap[command as string];
    callback(commandArgs);
  }

  rl.prompt();
});

rl.on("close", handleExit);

function handleExit() {
  process.exit(0);
}
function handleEcho(args: string[]) {
  console.log(args.join(" "));
  rl.prompt();
}
function handleType(commandStrArray: string[]) {
  const commandString = commandStrArray[0];
  const command = commandDictionary[commandString];

  if (command) {
    console.log(`${command} is a shell builtin`);
    return rl.prompt();
  }

  // Prints: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'
  if (!process.env.PATH) {
    return rl.prompt();
  }

  // Returns: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
  const pathArray = (process.env.PATH || "")
    .split(path.delimiter)
    .filter(Boolean);

  for (const dir of pathArray) {
    const filePath = path.join(dir, commandString);

    try {
      fs.accessSync(filePath, fs.constants.X_OK);
      console.log(`${commandString} is ${filePath}`);
      return rl.prompt();
    } catch (error) {
      continue;
    }
  }

  console.log(`${commandStrArray}: not found`);
  rl.prompt();
}
