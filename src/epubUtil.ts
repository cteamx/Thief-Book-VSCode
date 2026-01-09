import * as fs from "fs";
import * as path from "path";
import * as JSZip from "jszip";
import * as xmldom from "xmldom";
import * as xpath from "xpath";

const DOMParser = xmldom.DOMParser;

/**
 * EPUB 文件解析工具类
 * 负责解析 EPUB 文件并提取文本内容
 */
export class EpubParser {
    private epubPath: string;
    private zip: JSZip | null = null;
    private opfContent: string = "";
    private spineItems: string[] = [];
    private textContent: string = "";

    constructor(epubPath: string) {
        this.epubPath = epubPath;
    }

    /**
     * 初始化并解析 EPUB 文件
     */
    async init(): Promise<void> {
        try {
            // 读取 EPUB 文件（ZIP 格式）
            const epubBuffer = fs.readFileSync(this.epubPath);
            // 将 Buffer 转换为 Uint8Array 以兼容 JSZip
            const uint8Array = new Uint8Array(epubBuffer);
            this.zip = await JSZip.loadAsync(uint8Array);

            // 查找并解析 container.xml
            const containerFile = this.zip.file("META-INF/container.xml");
            if (!containerFile) {
                throw new Error("无法找到 container.xml");
            }
            const containerXml = await containerFile.async("string");

            // 提取 OPF 文件路径
            const opfPath = this.extractOpfPath(containerXml);
            if (!opfPath) {
                throw new Error("无法找到 OPF 文件路径");
            }

            // 读取并解析 OPF 文件
            const opfFile = this.zip.file(opfPath);
            if (opfFile) {
                this.opfContent = await opfFile.async("string") || "";
            } else {
                this.opfContent = "";
            }
            this.spineItems = this.extractSpineItems(this.opfContent, opfPath);

            // 提取所有章节文本
            this.textContent = await this.extractAllText();
        } catch (error) {
            throw new Error(`EPUB 解析失败: ${error}`);
        }
    }

    /**
     * 从 container.xml 中提取 OPF 文件路径
     */
    private extractOpfPath(containerXml: string): string | null {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(containerXml, "text/xml");
            const select = xpath.useNamespaces({ "n": "urn:oasis:names:tc:opendocument:xmlns:container" });
            const result = select("//n:rootfile/@full-path", doc);
            if (result && Array.isArray(result) && result.length > 0) {
                const node = result[0] as Attr;
                return node ? node.value : null;
            }
            return null;
        } catch (error) {
            // 如果 xpath 失败，尝试简单的字符串匹配
            const match = containerXml.match(/full-path="([^"]+)"/);
            return match ? match[1] : null;
        }
    }

    /**
     * 从 OPF 文件中提取 spine 项目（章节顺序）
     */
    private extractSpineItems(opfContent: string, opfPath: string): string[] {
        const parser = new DOMParser();
        const doc = parser.parseFromString(opfContent, "text/xml");
        const opfDir = path.dirname(opfPath);

        // 提取 manifest 中的文件映射
        const manifest: { [id: string]: string } = {};
        const manifestNodes = doc.getElementsByTagName("item");
        for (let i = 0; i < manifestNodes.length; i++) {
            const item = manifestNodes[i];
            const id = item.getAttribute("id");
            const href = item.getAttribute("href");
            if (id && href) {
                // 处理相对路径
                const fullPath = path.join(opfDir, href).replace(/\\/g, "/");
                manifest[id] = fullPath;
            }
        }

        // 提取 spine 顺序
        const spineItems: string[] = [];
        const spineNodes = doc.getElementsByTagName("itemref");
        for (let i = 0; i < spineNodes.length; i++) {
            const idref = spineNodes[i].getAttribute("idref");
            if (idref && manifest[idref]) {
                spineItems.push(manifest[idref]);
            }
        }

        return spineItems;
    }

    /**
     * 提取所有章节的文本内容
     */
    private async extractAllText(): Promise<string> {
        const allText: string[] = [];

        for (const itemPath of this.spineItems) {
            try {
                if (this.zip) {
                    const htmlFile = this.zip.file(itemPath);
                    if (htmlFile) {
                        const htmlContent = await htmlFile.async("string");
                        if (htmlContent) {
                            const text = this.extractTextFromHtml(htmlContent);
                            if (text.trim()) {
                                allText.push(text);
                            }
                        }
                    }
                }
            } catch (error) {
                // 跳过无法读取的章节
                console.warn(`无法读取章节: ${itemPath}`, error);
            }
        }

        return allText.join(" ");
    }

    /**
     * 从 HTML/XHTML 中提取纯文本
     */
    private extractTextFromHtml(html: string): string {
        // 简单的 HTML 标签移除和文本提取
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // 移除 script
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // 移除 style
            .replace(/<[^>]+>/g, " ") // 移除所有 HTML 标签
            .replace(/&nbsp;/g, " ")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#8217;/g, "'")
            .replace(/&#8220;/g, '"')
            .replace(/&#8221;/g, '"')
            .replace(/&#8211;/g, "-")
            .replace(/&#8212;/g, "--")
            .replace(/&[a-z]+;/gi, " ") // 移除其他 HTML 实体
            .replace(/\s+/g, " ") // 合并多个空格
            .trim();

        return text;
    }

    /**
     * 获取完整的文本内容
     */
    getText(): string {
        return this.textContent;
    }
}

