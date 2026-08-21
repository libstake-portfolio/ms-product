import sanitize from 'sanitize-html';

// The formatting an operator may use. Anything outside this list is dropped and only its text is kept.
const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

// Where the reading breaks. Stripping these away without leaving whitespace behind would run the
// text on either side together into one word.
const BLOCK_BOUNDARY = /<br\s*\/?>|<\/(?:p|li|ul|ol|h[1-6])>/gi;

// The parser decodes entities and the sanitizer escapes these back. Ampersand is undone last so an
// entity the author wrote literally is not unwrapped a second time.
const ESCAPED: ReadonlyArray<readonly [string, string]> = [
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&#39;', "'"],
    ['&amp;', '&'],
];

/**
 * Keeps the allowed formatting and removes the rest.
 */
export const sanitizeHtml = (html: string): string => sanitize(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: {} });

/**
 * Reduces markup to the plain text underneath it, on one line.
 */
export const removeHtmlTags = (html: string): string => {
    const stripped = sanitize(html.replace(BLOCK_BOUNDARY, ' '), { allowedTags: [], allowedAttributes: {} });
    const decoded = ESCAPED.reduce((text, [entity, character]) => text.split(entity).join(character), stripped);

    return decoded.replace(/\s+/g, ' ').trim();
};
