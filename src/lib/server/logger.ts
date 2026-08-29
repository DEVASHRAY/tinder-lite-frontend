import "server-only";

import { LoggerConstantsCollection } from "@/lib/server/logger.constants";

type LogLevel =
  (typeof LoggerConstantsCollection.LogLevel)[keyof typeof LoggerConstantsCollection.LogLevel];

interface PaintInput {
  color: string;
  text: string;
}

interface FormatLogInput {
  detail: string | null;
  level: LogLevel;
  message: string;
}

interface LogInput {
  detail?: string | null;
  level: LogLevel;
  message: string;
}

interface LoggerMessageInput<Thrown = never> {
  detail?: string | null;
  error?: Thrown;
  message: string;
}

interface ErrorDetailInput {
  error: Error;
}

interface AppStackFrameInput {
  stack: string;
}

const iconByLevel: Record<LogLevel, string> = {
  [LoggerConstantsCollection.LogLevel.Success]: "✅",
  [LoggerConstantsCollection.LogLevel.Fail]: "❌",
  [LoggerConstantsCollection.LogLevel.Warn]: "⚠️",
  [LoggerConstantsCollection.LogLevel.Info]: "ℹ️",
  [LoggerConstantsCollection.LogLevel.Debug]: "🔎",
};

const labelByLevel: Record<LogLevel, string> = {
  [LoggerConstantsCollection.LogLevel.Success]: "PASS",
  [LoggerConstantsCollection.LogLevel.Fail]: "FAIL",
  [LoggerConstantsCollection.LogLevel.Warn]: "WARN",
  [LoggerConstantsCollection.LogLevel.Info]: "INFO",
  [LoggerConstantsCollection.LogLevel.Debug]: "DEBUG",
};

// These are terminal color codes, not CSS. `\u001b` is Escape; `[0m` resets the color.
const colorByLevel: Record<LogLevel, string> = {
  [LoggerConstantsCollection.LogLevel.Success]: "\u001b[32m",
  [LoggerConstantsCollection.LogLevel.Fail]: "\u001b[31m",
  [LoggerConstantsCollection.LogLevel.Warn]: "\u001b[33m",
  [LoggerConstantsCollection.LogLevel.Info]: "\u001b[36m",
  [LoggerConstantsCollection.LogLevel.Debug]: "\u001b[90m",
};

const reset = "\u001b[0m";
const dim = "\u001b[2m";

const paint = ({ color, text }: PaintInput): string => {
  // `process.stdout` is this program's output pipe. `isTTY` means a real terminal.
  // Skip colors when logs go to a file, PM2, or systemd.
  if (!process.stdout.isTTY) {
    return text;
  }

  return `${color}${text}${reset}`;
};

const timestamp = (): string => new Date().toISOString();

const formatLog = ({ level, message, detail }: FormatLogInput): string => {
  const header = `${iconByLevel[level]}  ${labelByLevel[level].padEnd(5)}  ${paint({ color: dim, text: timestamp() })}`;
  const title = paint({ color: colorByLevel[level], text: header });
  const body = `    ${message}`;

  if (!detail) {
    return `${title}\n${body}`;
  }

  return `${title}\n${body}\n${paint({ color: dim, text: `    ${detail}` })}`;
};

const write = ({ level, message, detail }: FormatLogInput): void => {
  const formatted = formatLog({ level, message, detail });

  if (level === LoggerConstantsCollection.LogLevel.Fail) {
    console.error(formatted);
    return;
  }

  if (level === LoggerConstantsCollection.LogLevel.Warn) {
    console.warn(formatted);
    return;
  }

  console.log(formatted);
};

const log = ({ level, message, detail = null }: LogInput): void => {
  write({ level, message, detail });
};

const appStackFrame = ({ stack }: AppStackFrameInput): string | null => {
  const srcMarker = "/src/";
  const lines = stack.split("\n");

  for (const line of lines) {
    if (line.includes("node_modules")) {
      continue;
    }

    const srcIndex = line.indexOf(srcMarker);
    if (srcIndex === -1) {
      continue;
    }

    const fromSrc = line.slice(srcIndex + 1);
    const closingParen = fromSrc.indexOf(")");
    if (closingParen === -1) {
      return fromSrc;
    }

    return fromSrc.slice(0, closingParen);
  }

  return null;
};

const errorDetail = ({ error }: ErrorDetailInput): string => {
  if (!error.stack) {
    return error.message;
  }

  const file = appStackFrame({ stack: error.stack });
  if (!file) {
    return error.message;
  }

  return `${error.message}\n    ${file}`;
};

const resolveLogDetail = <Thrown>({
  detail = null,
  error,
}: LoggerMessageInput<Thrown>): string | null => {
  if (error instanceof Error) {
    const fromError = errorDetail({ error });

    if (!detail) {
      return fromError;
    }

    return `${detail}\n    ${fromError}`;
  }

  return detail;
};

export const logger = {
  success: <Thrown>(input: LoggerMessageInput<Thrown>): void => {
    log({
      level: LoggerConstantsCollection.LogLevel.Success,
      message: input.message,
      detail: resolveLogDetail(input),
    });
  },
  fail: <Thrown>(input: LoggerMessageInput<Thrown>): void => {
    log({
      level: LoggerConstantsCollection.LogLevel.Fail,
      message: input.message,
      detail: resolveLogDetail(input),
    });
  },
  warn: <Thrown>(input: LoggerMessageInput<Thrown>): void => {
    log({
      level: LoggerConstantsCollection.LogLevel.Warn,
      message: input.message,
      detail: resolveLogDetail(input),
    });
  },
  info: <Thrown>(input: LoggerMessageInput<Thrown>): void => {
    log({
      level: LoggerConstantsCollection.LogLevel.Info,
      message: input.message,
      detail: resolveLogDetail(input),
    });
  },
  debug: <Thrown>(input: LoggerMessageInput<Thrown>): void => {
    log({
      level: LoggerConstantsCollection.LogLevel.Debug,
      message: input.message,
      detail: resolveLogDetail(input),
    });
  },
};
