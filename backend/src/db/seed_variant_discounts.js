import pool from "./index.js";

function computeDefaultDiscount(product) {
    const id = Number(product.id || product.product_id || 1);
    const cat = (product.category || product.category_type || "").toLowerCase();
    const name = (product.name || product.product_name || "").toLowerCase();

    if (
        cat.includes("shoes") ||
        cat.includes("footwear") ||
        name.includes("shoe") ||
        name.includes("sneaker") ||
        name.includes("boot") ||
        name.includes("loafer")
    ) {
        return 30;
    } else if (
        cat.includes("winter") ||
        cat.includes("jacket") ||
        cat.includes("outerwear") ||
        name.includes("jacket") ||
        name.includes("hoodie") ||
        name.includes("sweater") ||
        name.includes("coat") ||
        name.includes("puffer")
    ) {
        return 25;
    } else if (
        cat.includes("ethnic") ||
        cat.includes("festive") ||
        name.includes("kurta") ||
        name.includes("chikankari")
    ) {
        return 35;
    } else if (
        cat.includes("accessor") ||
        name.includes("cap") ||
        name.includes("belt") ||
        name.includes("wallet") ||
        name.includes("sunglass") ||
        name.includes("backpack")
    ) {
        return 15;
    } else if (
        cat.includes("formal") ||
        name.includes("suit") ||
        name.includes("blazer") ||
        name.includes("tuxedo") ||
        name.includes("dress shirt")
    ) {
        return 20;
    } else if (
        name.includes("t-shirt") ||
        name.includes("tee") ||
        name.includes("tank")
    ) {
        return 20;
    } else if (name.includes("jeans") || name.includes("chino")) {
        return 18;
    } else {
        const tiers = [20, 25, 15, 30, 22, 18, 35, 28];
        return tiers[id % tiers.length];
    }
}

export async function seedVariantDiscounts() {
    console.log("Seeding category-based discounts into product_variant table...");

    const [products] = await pool.query(`
        SELECT 
            p.product_id AS id,
            p.product_name AS name,
            COALESCE(c.category_type, 'General') AS category
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        ORDER BY p.product_id ASC
    `);

    let totalUpdated = 0;

    for (const prod of products) {
        const defaultDiscount = computeDefaultDiscount(prod);
        const [result] = await pool.query(
            "UPDATE product_variant SET discount_percent = ? WHERE product_id = ?",
            [defaultDiscount, prod.id]
        );
        totalUpdated += result.affectedRows;
        console.log(`Product #${prod.id} (${prod.name}) [${prod.category}] -> ${defaultDiscount}% OFF (${result.affectedRows} variants updated)`);
    }

    console.log(`\nSuccessfully populated discounts for ${totalUpdated} variants across ${products.length} products!`);
}

if (process.argv[1]?.includes("seed_variant_discounts.js")) {
    seedVariantDiscounts()
        .then(() => {
            console.log("Done.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Seeding failed:", err);
            process.exit(1);
        });
}

