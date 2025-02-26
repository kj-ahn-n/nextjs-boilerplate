
import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const url = "https://redditinc.com/blog";
        
        // Puppeteer 실행
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // 블로그 목록 스크래핑
        const articles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".entry-header")).map(el => {
                const titleElement = el.querySelector("h2.entry-title a");
                const dateElement = el.querySelector("time.entry-date");

                return {
                    title: titleElement?.textContent?.trim() || "",
                    link: titleElement?.getAttribute("href") || "",
                    date: dateElement?.textContent?.trim() || ""
                };
            });
        });

        await browser.close();

        res.status(200).json({ articles });
    } catch (error) {
        console.error("Scraping failed:", error);
        res.status(500).json({ error: "Scraping failed" });
    }
}