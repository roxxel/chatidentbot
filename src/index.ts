import { Bot } from "grammy";
import { buildMessage, combineMessages } from "./helpers";
import dedent from "dedent";

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("Missing TELEGRAM_TOKEN in environment");
  process.exit(1);
}

function fullName(from?: any): string {
  if (!from) return "N/A";
  return [from.first_name, from.last_name].filter(Boolean).join(" ");
}
const mentionMarkdownV2 = (user: any) => {
  const name = fullName(user).replace(
    /([\_\*\[\]\(\)\~\`\>\#\+\-\=\|\{\}\.\!])/g,
    "\\$1"
  );
  return `[${name}](tg://user?id=${user.id})`;
};

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const user = ctx.from;
  const text = `Hi ${mentionMarkdownV2(user)}\\!
  I'm a bot that helps you get IDs of users and chats\\.
  Type /help to see what I can do\\.`;
  await ctx.reply(text, { parse_mode: "MarkdownV2" });
});

bot.command("help", async (ctx) => {
  const text = dedent`
    I can help you get the IDs of users and chats.
    Here are the commands you can use:
    /id - Get the ID of the user, chat, and replied user (if applicable).
    /json - Get the raw JSON data of the message you sent to me.
    /help - Show this help message.
  `;
  await ctx.reply(text);
});

bot.command("json", async (ctx) => {
  const msg = ctx.message;
  if (!msg) {
    await ctx.reply("No message data available.");
    return;
  }
  const jsonString = JSON.stringify(msg, null, 2);
  if (jsonString.length < 4000) {
    await ctx.reply("```json\n" + jsonString + "\n```", {
      parse_mode: "MarkdownV2",
    });
  } else {
    await ctx.reply(
      "The message data is too long to display here. Please use a bot or tool that can handle large JSON data."
    );
  }
});

bot.command("id", async (ctx) => {
  const me = ctx.from;
  const chat = ctx.chat;
  const msg = ctx.message;

  const messages: string[] = [
    buildMessage("👨‍💻 You", {
      ID: String(me?.id ?? "N/A"),
      Name: fullName(me),
      Username: me?.username ? `@${me.username}` : "N/A",
    }),
  ];

  if (chat && me && chat.id !== me.id) {
    messages.push(
      buildMessage("💬 This Chat", {
        ID: String(chat.id),
        Type: chat.type || "N/A",
        Title: chat.title || "N/A",
        "Message Thread ID": msg?.message_thread_id
          ? String(msg.message_thread_id)
          : "N/A",
        Username: chat.username ? `@${chat.username}` : "N/A",
      })
    );
  }

  const replied = msg?.reply_to_message?.from;
  if (replied && me && replied.id !== me.id) {
    messages.push(
      buildMessage("↩️ Replied User", {
        ID: String(replied.id),
        Name: fullName(replied),
        "Is Bot": replied.is_bot ? "Yes" : "No",
        Username: replied.username ? `@${replied.username}` : "N/A",
      })
    );
  }

  await ctx.reply(combineMessages(...messages), {
    parse_mode: "MarkdownV2",
    message_thread_id: msg?.message_thread_id,
  });
});

console.log("Bot is starting...");
bot.start().catch((err) => {
  console.error(err);
});
console.log("Bot started successfully.");
