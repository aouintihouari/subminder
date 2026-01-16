import { PrismaClient, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

const createCat = (
  name: string,
  slug: string,
  icon: string,
  color: string,
  type: CategoryType,
  isDigital: boolean = false
) => ({
  name,
  slug,
  icon,
  color,
  type,
  isDigital,
  isSystem: true,
  userId: null,
});

const systemCategories = [
  // --- HOUSING & UTILITIES ---
  createCat(
    "Housing",
    "housing",
    "home",
    "#F97316",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Utilities",
    "utilities",
    "zap",
    "#F59E0B",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Phone & Internet",
    "communication",
    "wifi",
    "#3B82F6",
    CategoryType.EXPENSE,
    true
  ),
  createCat(
    "Insurance",
    "insurance",
    "shield",
    "#64748B",
    CategoryType.EXPENSE,
    true
  ),

  // --- FOOD ---
  createCat(
    "Groceries",
    "groceries",
    "shopping-cart",
    "#10B981",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Restaurants & Bars",
    "eating-out",
    "utensils",
    "#EF4444",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Coffee & Snacks",
    "coffee",
    "coffee",
    "#78350F",
    CategoryType.EXPENSE,
    false
  ),

  // --- TRANSPORT ---
  createCat(
    "Transportation",
    "transport",
    "bus",
    "#0EA5E9",
    CategoryType.EXPENSE,
    false
  ),
  createCat("Car", "car", "car", "#0284C7", CategoryType.EXPENSE, false),

  // --- LIFESTYLE ---
  createCat(
    "Shopping",
    "shopping",
    "shopping-bag",
    "#EC4899",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Electronics",
    "electronics",
    "smartphone",
    "#6366F1",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Personal Care",
    "personal-care",
    "sparkles",
    "#D946EF",
    CategoryType.EXPENSE,
    false
  ),
  createCat("Pets", "pets", "dog", "#A16207", CategoryType.EXPENSE, false),
  createCat(
    "Books & Education",
    "education",
    "book",
    "#8B5CF6",
    CategoryType.EXPENSE,
    true
  ),

  // --- HEALTH ---
  createCat(
    "Health & Fitness",
    "health",
    "heart-pulse",
    "#22C55E",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Sports",
    "sport",
    "dumbbell",
    "#16A34A",
    CategoryType.EXPENSE,
    false
  ),

  // --- ENTERTAINMENT ---
  createCat(
    "Entertainment",
    "entertainment",
    "film",
    "#8B5CF6",
    CategoryType.EXPENSE,
    true
  ),
  createCat(
    "Social",
    "social",
    "users",
    "#F43F5E",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Travel",
    "travel",
    "plane",
    "#06B6D4",
    CategoryType.EXPENSE,
    false
  ),

  // --- FINANCIAL ---
  createCat(
    "Taxes",
    "taxes",
    "landmark",
    "#94A3B8",
    CategoryType.EXPENSE,
    true
  ),
  createCat(
    "Bills & Fees",
    "bills",
    "receipt",
    "#64748B",
    CategoryType.EXPENSE,
    true
  ),
  createCat(
    "Family & Kids",
    "family",
    "baby",
    "#FB7185",
    CategoryType.EXPENSE,
    false
  ),
  createCat(
    "Other Expense",
    "other-expense",
    "help-circle",
    "#CBD5E1",
    CategoryType.EXPENSE,
    false
  ),

  // --- INCOMES ---
  createCat(
    "Salary",
    "salary",
    "briefcase",
    "#10B981",
    CategoryType.INCOME,
    false
  ),
  createCat(
    "Freelance / Contract",
    "freelance",
    "laptop",
    "#34D399",
    CategoryType.INCOME,
    true
  ),
  createCat(
    "Investments",
    "investments",
    "trending-up",
    "#22C55E",
    CategoryType.INCOME,
    true
  ),
  createCat(
    "Rental Income",
    "rental-income",
    "key",
    "#A3E635",
    CategoryType.INCOME,
    false
  ),
  createCat(
    "Grants & Awards",
    "grants",
    "award",
    "#FCD34D",
    CategoryType.INCOME,
    false
  ),
  createCat(
    "Refunds",
    "refunds",
    "refresh-cw",
    "#60A5FA",
    CategoryType.INCOME,
    true
  ),
  createCat("Sales", "sales", "tag", "#F472B6", CategoryType.INCOME, false),
  createCat(
    "Coupons & Cashback",
    "coupons",
    "ticket",
    "#FB923C",
    CategoryType.INCOME,
    true
  ),
  createCat(
    "Other Income",
    "other-income",
    "plus-circle",
    "#94A3B8",
    CategoryType.INCOME,
    false
  ),
];

async function main() {
  console.log("🌱 Starting seeding...");

  for (const cat of systemCategories) {
    await prisma.category
      .upsert({
        where: {
          slug_userId: {
            slug: cat.slug,
            userId: 0,
          } as any,
        },
        update: cat,
        create: cat,
      })
      .catch(async () => {
        const existing = await prisma.category.findFirst({
          where: { slug: cat.slug, isSystem: true },
        });
        if (!existing) {
          await prisma.category.create({ data: cat });
          console.log(`   Created: ${cat.name}`);
        } else {
          await prisma.category.update({
            where: { id: existing.id },
            data: cat,
          });
          console.log(`   Updated: ${cat.name}`);
        }
      });
  }
  console.log(`✅ Seeded ${systemCategories.length} system categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
