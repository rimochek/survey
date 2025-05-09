from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types.bot_command import BotCommand

from data import config

storage = MemoryStorage()
dp = Dispatcher(storage=storage)
bot = Bot(token=config.TOKEN)
listOfCommands = [BotCommand(command="/start", description="Рестарт бота")]