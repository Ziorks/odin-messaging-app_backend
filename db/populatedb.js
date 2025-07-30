const { PrismaClient } = require("../generated/prisma");
const { simpleFaker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 100; i++) {
    await prisma.user.create({
      data: {
        password: "123456",
        username: simpleFaker.string.alphanumeric({
          length: { max: 16, min: 4 },
        }),
        profile: { create: {} },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
