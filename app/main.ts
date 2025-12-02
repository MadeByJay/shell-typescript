import { createInterface } from "readline";
import { CommandHandler } from "./commands";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  rl.question("$ ", (input) => {
    const [command, ...args] = input.split(" ");

    try {
      const commandHandler = new CommandHandler(rl, command, args);
      commandHandler.execute();
      const shouldExit = commandHandler.shouldExit;

      if (shouldExit) return rl.close();
    } catch (error) {
      if (error instanceof Error) {
        rl.write(error.message);
      }
    }
    promptUser();
  });
}

promptUser();
