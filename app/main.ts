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
};

const commands: CommandDictionary = {
  ["exit"]: "exit",
  ["echo"]: "echo",
} as const;

rl.setPrompt("$ ");
rl.prompt();

rl.on("line", (line) => {
  const stringArray = line.trim().split(" ");
  const [commandString, ...commandArgs] = stringArray;
  const command = commands[commandString];

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
