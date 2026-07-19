<script lang="ts">
	type Block =
		| { type: 'heading'; level: 2 | 3; text: string }
		| { type: 'paragraph'; text: string }
		| { type: 'list'; items: string[] };

	let { text }: { text: string } = $props();

	function parseDocument(source: string): Block[] {
		const blocks: Block[] = [];
		let paragraph: string[] = [];
		let list: string[] = [];
		const flushParagraph = () => {
			const value = paragraph.join(' ').trim();
			if (value) blocks.push({ type: 'paragraph', text: value });
			paragraph = [];
		};
		const flushList = () => {
			if (list.length) blocks.push({ type: 'list', items: list });
			list = [];
		};
		for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
			const line = raw.trim();
			if (!line) {
				flushParagraph();
				flushList();
				continue;
			}
			if (line.startsWith('### ')) {
				flushParagraph();
				flushList();
				blocks.push({ type: 'heading', level: 3, text: line.slice(4).trim() });
				continue;
			}
			if (line.startsWith('## ')) {
				flushParagraph();
				flushList();
				blocks.push({ type: 'heading', level: 2, text: line.slice(3).trim() });
				continue;
			}
			if (line.startsWith('- ')) {
				flushParagraph();
				list.push(line.slice(2).trim());
				continue;
			}
			flushList();
			paragraph.push(line);
		}
		flushParagraph();
		flushList();
		return blocks;
	}

	const blocks = $derived(parseDocument(text));
</script>

{#each blocks as block, index (`${block.type}-${index}`)}
	{#if block.type === 'heading' && block.level === 2}
		<h2>{block.text}</h2>
	{:else if block.type === 'heading'}
		<h3>{block.text}</h3>
	{:else if block.type === 'paragraph'}
		<p>{block.text}</p>
	{:else}
		<ul>
			{#each block.items as item (item)}<li>{item}</li>{/each}
		</ul>
	{/if}
{/each}
