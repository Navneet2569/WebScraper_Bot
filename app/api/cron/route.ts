import { NextResponse } from "next/server";
import {
  getLowestPrice,
  getHighestPrice,
  getAveragePrice,
  getEmailNotifType,
} from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await connectToDB(); // Ensure database connection is awaited

    const products = await Product.find({});

    if (!products) throw new Error("No products fetched");

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) return null; // Handle missing scrapedProduct

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { new: true } // Ensure the updated document is returned
        );

        if (!updatedProduct) return null; // Handle case where product update fails

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users?.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          // Construct emailContent
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifType
          );

          // Get array of user emails
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    // Filter out any null values from the updatedProducts array
    const validUpdatedProducts = updatedProducts.filter(
      (product) => product !== null
    );

    return NextResponse.json({
      message: "Ok",
      data: validUpdatedProducts,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: `Failed to get all products: ${error.message}`,
      error: true,
    });
  }
}
