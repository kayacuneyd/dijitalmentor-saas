<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import Underline from '@tiptap/extension-underline';
	import { emptyBlogDoc, parseBlogDoc, type BlogDoc } from '$lib/blog/content';

	let {
		name,
		value = emptyBlogDoc(),
		placeholder = 'Write the article body...'
	} = $props<{
		name: string;
		value?: BlogDoc;
		placeholder?: string;
	}>();

	let element: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let serialized = $state('');

	function sync() {
		if (!editor) return;
		serialized = JSON.stringify(editor.getJSON());
	}

	function run(command: () => void) {
		command();
		editor?.commands.focus();
		sync();
	}

	function setLink() {
		if (!editor) return;
		const previous = editor.getAttributes('link').href as string | undefined;
		const href = window.prompt('Link URL', previous ?? 'https://');
		if (href === null) return;
		if (href.trim() === '') {
			run(() => editor?.chain().focus().unsetLink().run());
			return;
		}
		run(() =>
			editor
				?.chain()
				.focus()
				.extendMarkRange('link')
				.setLink({ href: href.trim(), target: '_blank', rel: 'noopener noreferrer' })
				.run()
		);
	}

	function addImage() {
		if (!editor) return;
		const src = window.prompt('Image URL', 'https://');
		if (!src?.trim()) return;
		const alt = window.prompt('Alt text', '') ?? '';
		run(() => editor?.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run());
	}

	onMount(() => {
		const initialDoc = parseBlogDoc(value);
		serialized = JSON.stringify(initialDoc);
		editor = new Editor({
			element,
			content: initialDoc,
			extensions: [
				StarterKit.configure({
					heading: { levels: [2, 3] }
				}),
				Underline,
				Link.configure({
					openOnClick: false,
					autolink: true,
					defaultProtocol: 'https'
				}),
				Image,
				Placeholder.configure({ placeholder })
			],
			onUpdate: sync
		});
		sync();
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div class="sk-rich-editor">
	<div class="sk-rich-editor-toolbar" aria-label="Editor toolbar">
		<button
			type="button"
			data-active={editor?.isActive('heading', { level: 2 }) ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
		>
			H2
		</button>
		<button
			type="button"
			data-active={editor?.isActive('heading', { level: 3 }) ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
		>
			H3
		</button>
		<button
			type="button"
			data-active={editor?.isActive('bold') ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleBold().run())}
		>
			B
		</button>
		<button
			type="button"
			data-active={editor?.isActive('italic') ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleItalic().run())}
		>
			I
		</button>
		<button
			type="button"
			data-active={editor?.isActive('underline') ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleUnderline().run())}
		>
			U
		</button>
		<button
			type="button"
			data-active={editor?.isActive('bulletList') ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleBulletList().run())}
		>
			UL
		</button>
		<button
			type="button"
			data-active={editor?.isActive('orderedList') ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleOrderedList().run())}
		>
			OL
		</button>
		<button
			type="button"
			data-active={editor?.isActive('blockquote') ? 'true' : 'false'}
			onclick={() => run(() => editor?.chain().focus().toggleBlockquote().run())}
		>
			Quote
		</button>
		<button
			type="button"
			data-active={editor?.isActive('link') ? 'true' : 'false'}
			onclick={setLink}
		>
			Link
		</button>
		<button type="button" onclick={addImage}>Image</button>
	</div>
	<div bind:this={element} class="sk-rich-editor-surface"></div>
	<textarea {name} class="hidden" aria-hidden="true" tabindex="-1" bind:value={serialized}
	></textarea>
</div>
