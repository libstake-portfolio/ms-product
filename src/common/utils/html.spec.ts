import { removeHtmlTags, sanitizeHtml } from './html';

describe('sanitizeHtml', () => {
    it('keeps the formatting an operator is allowed to use', () => {
        const html = '<p>a <strong>b</strong> <em>c</em> <u>d</u> <s>e</s></p><ul><li>f</li></ul><h2>g</h2>';

        expect(sanitizeHtml(html)).toBe(html);
    });

    it('drops a script along with the code inside it', () => {
        expect(sanitizeHtml('<p>a</p><script>alert(1)</script>')).toBe('<p>a</p>');
    });

    it('drops event handlers while keeping the tag', () => {
        expect(sanitizeHtml('<p onclick="steal()">a</p>')).toBe('<p>a</p>');
    });

    it('drops every attribute, including the ones that carry style', () => {
        expect(sanitizeHtml('<p class="x" style="color:red" data-id="1">a</p>')).toBe('<p>a</p>');
    });

    it('unwraps links and images, keeping the text that was inside', () => {
        expect(sanitizeHtml('<a href="javascript:alert(1)">a</a><img src="x" onerror="steal()">')).toBe('a');
    });

    it('unwraps an embedded frame', () => {
        expect(sanitizeHtml('<iframe src="https://elsewhere"></iframe>')).toBe('');
    });

    it('does not let a nested tag survive the removal of its parent', () => {
        expect(sanitizeHtml('<div><scr<script>ipt>alert(1)</scr</script>ipt></div>')).toBe('ipt&gt;alert(1)ipt&gt;');
    });
});

describe('removeHtmlTags', () => {
    it('leaves only the text', () => {
        expect(removeHtmlTags('<p>a <strong>b</strong></p>')).toBe('a b');
    });

    it('separates blocks that were adjacent', () => {
        expect(removeHtmlTags('<p>a</p><p>b</p>')).toBe('a b');
    });

    it('separates list items and line breaks', () => {
        expect(removeHtmlTags('<ul><li>a</li><li>b</li></ul>c<br>d')).toBe('a b c d');
    });

    it('restores entities to the characters they stand for', () => {
        expect(removeHtmlTags('<p>a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39; &hellip;</p>')).toBe(`a & b <c> "d" 'e' …`);
    });

    it('does not unwrap an entity the author wrote literally', () => {
        expect(removeHtmlTags('<p>&amp;lt;</p>')).toBe('&lt;');
    });

    it('collapses runs of whitespace and trims the ends', () => {
        expect(removeHtmlTags('<p>  a \n\n b &nbsp; c  </p>')).toBe('a b c');
    });

    it('returns nothing for markup that carries no text', () => {
        expect(removeHtmlTags('<p></p><br>')).toBe('');
    });
});
