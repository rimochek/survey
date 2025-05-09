from aiogram import Router, types, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.filters.command import CommandStart

router = Router()

@router.message(CommandStart())
async def welcome(message: Message):
    await message.answer(
        text="Чтобы перейти к опроснику, нажмите яркую кнопку внизу ↓"
    )