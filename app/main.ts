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
}
function handleType(commandStrArray: string[]) {
  const command = commandDictionary[commandStrArray[0]];

  if (!command) {
    console.log(`${commandStrArray}: not found`);
    return;
  }

  console.log(`${command} is a shell builtin`);
}
