import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from telegram import Update, Bot
from telegram.ext import Dispatcher, CommandHandler

TOKEN = os.environ.get("TOKEN")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NotificationRequest(BaseModel):
    telegram_id: int
    approved: str

class TelegramWebhook(BaseModel):
    '''
    Telegram Webhook Model using Pydantic for request body validation
    '''
    update_id: int
    message: Optional[dict]
    edited_message: Optional[dict]
    channel_post: Optional[dict]
    edited_channel_post: Optional[dict]
    inline_query: Optional[dict]
    chosen_inline_result: Optional[dict]
    callback_query: Optional[dict]
    shipping_query: Optional[dict]
    pre_checkout_query: Optional[dict]
    poll: Optional[dict]
    poll_answer: Optional[dict]

def start(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Click the Open button to open Mini App")

def register_handlers(dispatcher):
    start_handler = CommandHandler('start', start)
    dispatcher.add_handler(start_handler)

@app.post("/webhook")
def webhook(webhook_data: TelegramWebhook):
    '''
    Telegram Webhook
    '''
    bot = Bot(token=TOKEN)
    update = Update.de_json(webhook_data.__dict__, bot)
    dispatcher = Dispatcher(bot, None, workers=4)
    register_handlers(dispatcher)

    dispatcher.process_update(update)

    return {"message": "ok"}

@app.post("/notify")
def notify(req: NotificationRequest):
    try:
        bot = Bot(token=TOKEN)
        message = "✅ You have been accepted!" if req.approved == "Accepted" else "❌ You have been rejected."
        bot.send_message(chat_id=req.telegram_id, text=message)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def index():
    return {"message": "Hello World"}