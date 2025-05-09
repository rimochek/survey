import asyncio
import logging

from loader import dp, bot, listOfCommands
from handlers import start

async def main():
    logging.basicConfig(
        level=logging.INFO, filename="data/usersAction.log",
        format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
    )

    await bot.set_my_commands(listOfCommands)

    dp.include_routers(
        start.router
    )

    await dp.start_polling(bot)
    print("bot is launched")

if __name__ == "__main__":
    asyncio.run(main())