import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let url = "https://redditinc.com/blog"; // 시작 페이지
        const articles: { title: string; link: string; date: string }[] = [];
        let hasNextPage = true;
        let pageNumber = 1; // 페이지 수 추적

        while (hasNextPage && pageNumber <= 10) { // 최대 10페이지까지 크롤링
            console.log(`🔍 Scraping page ${pageNumber}: ${url}`);
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            // 현재 페이지의 글 크롤링
            $(".entry-header").each((_, element) => {
                const titleElement = $(element).find("h2.entry-title a");
                const dateElement = $(element).find("time.entry-date");

                const title = titleElement.text().trim();
                const link = titleElement.attr("href") || "";
                const date = dateElement.text().trim();

                if (title && link && date) {
                    articles.push({ title, link, date });
                }
            });

            // 다음 페이지 링크 찾기
            const nextPageElement = $(".hs-pagination__link--next");
            const nextPage = nextPageElement.attr("href");

            // 다음 페이지가 없거나 10페이지를 초과하면 종료
            console.log('pageNumber: ', pageNumber);
            if (!nextPage || pageNumber >= 10) {
                hasNextPage = false;
                break;
            }

            // 다음 페이지로 이동
            url = nextPage;
            pageNumber++; // 페이지 증가

            // 딜레이 추가 (랜덤 2~5초)
            const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
            console.log(`⏳ Waiting ${delay / 1000} seconds before next page...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log("✅ Finished scraping up to 10 pages!");
        res.status(200).json({ articles });
    } catch (error) {
        console.error("❌ Scraping failed:", error);
        res.status(500).json({ error: "Scraping failed" });
    }
}