import path from "path";
import fs from "fs";
import type { Interface } from "readline";
import { spawn, spawnSync } from "child_process";

interface Command {
  type: { name: "builtin" } | { name: "external"; path: string };
  execute: () => void;
  shouldExit: boolean;
}

const getCommand = ({
  name,
  rl,
  args,
}: {
  name: string;
  rl: Interface;
  args: string[];
}): Command => {
  switch (name) {
    case "exit": {
      return {
        type: { name: "builtin" },
        execute: () => true,
        shouldExit: true,
      };
    }

    case "echo": {
      return {
        type: { name: "builtin" },
        execute: () => {
          rl.write(`${args.join(" ")}\n`);
          return;
        },
        shouldExit: false,
      };
    }

    case "type": {
      return {
        type: { name: "builtin" },
        execute: () => {
          const commandName = args[0];
          const command = getCommand({ name: commandName, rl, args: [] });

          switch (command?.type.name) {
            case "builtin":
              rl.write(`${commandName} is a shell builtin\n`);
              break;

            case "external":
              rl.write(`${commandName} is ${command.type.path}\n`);
              break;
          }
        },
        shouldExit: false,
      };
    }

    default: {
      // Returns: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
      const directories = (process.env.PATH || "")
        .split(path.delimiter)
        .filter(Boolean);

      const commandDirectory = directories.find((directory) => {
        const pathToCheck = path.join(directory, name);
        if (!fs.existsSync(pathToCheck)) return false;

        try {
          fs.accessSync(pathToCheck, fs.constants.X_OK);
          return true;
        } catch (error) {
          return false;
        }
      });

      if (commandDirectory) {
        const commandPath = `${commandDirectory}/${name}`;
        return {
          type: { name: "external", path: commandPath },
          execute: () => {
            const childProcess = spawnSync(name, args);
            if (childProcess.stdout) {
              rl.write(childProcess.stdout.toString());
            } else if (childProcess.stderr) {
              rl.write(childProcess.stderr.toString());
            }
            return;
          },
          shouldExit: false,
        };
      }
      throw new Error(`${name}: not found \n`);
    }
  }
};

export class CommandHandler {
  private readonly command: Command;
  readonly shouldExit: boolean;

  constructor(rl: Interface, name: string, args: string[]) {
    this.command = getCommand({ name, rl, args });
    this.shouldExit = this.command.shouldExit;
  }

  execute() {
    return this.command.execute();
  }
}
