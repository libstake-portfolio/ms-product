export const sanitizeHtml = (html: string): string => {
    // TODO - implement HTML sanitization logic here
    return html;
};

export const removeHtmlTags = (html: string): string => {
    // TODO - implement logic to remove HTML tags from the input string
    return html.replace(/<[^>]*>/g, '');
};
