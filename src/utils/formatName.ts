/**
 * 英文姓名格式化：整串轉小寫後，只有開頭與空格 / 連字號後的第一個字母大寫，
 * 例如 "jean-PAUL" → "Jean-Paul"、"van der berg" → "Van Der Berg"，
 * 讓標籤文字寬度較容易預測與控管。
 */
export function formatEnglishName(name?: string | null): string {
    if (!name) return ''
    return name
        .trim()
        .toLowerCase()
        .replace(/(^|[- ]+)(.)/g, (_match, separator: string, letter: string) => separator + letter.toUpperCase())
}
