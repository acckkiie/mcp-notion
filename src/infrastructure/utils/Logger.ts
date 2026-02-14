import log4js from "log4js";

log4js.configure({
  appenders: {
    stdout: { type: "stdout" },
  },
  categories: {
    default: { appenders: ["stdout"], level: "info" },
  },
});

export const getLogger = (category?: string) => {
  return log4js.getLogger(category);
};
