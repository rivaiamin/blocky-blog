import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Block {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'list' | 'divider';
  content: any;
  order: number;
}

interface BlockEditorProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, setBlocks }: BlockEditorProps) {
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

  const addBlock = (type: Block['type'], afterId?: string) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: afterId ? getBlockOrder(afterId) + 0.5 : blocks.length,
    };

    const newBlocks = [...blocks, newBlock].sort((a, b) => a.order - b.order);
    setBlocks(newBlocks.map((block, index) => ({ ...block, order: index })));
    setShowBlockMenu(null);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const getBlockOrder = (id: string) => {
    const block = blocks.find(b => b.id === id);
    return block ? block.order : 0;
  };

  const getDefaultContent = (type: Block['type']) => {
    switch (type) {
      case 'heading': return { text: '', level: 2 };
      case 'paragraph': return { text: '' };
      case 'quote': return { text: '', author: '' };
      case 'list': return { items: [''], ordered: false };
      case 'image': return { url: '', title: '', caption: '' };
      case 'divider': return {};
      default: return {};
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items.map((block, index) => ({ ...block, order: index })));
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group relative ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          {...provided.dragHandleProps}
                          className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 cursor-grab active:cursor-grabbing"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <BlockRenderer
                            block={block}
                            updateBlock={updateBlock}
                            deleteBlock={deleteBlock}
                          />
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
                          className="absolute -left-8 top-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-sm flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                        
                        {showBlockMenu === block.id && (
                          <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                            <BlockMenu onAddBlock={(type) => addBlock(type, block.id)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {blocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Start building your post</p>
          <BlockMenu onAddBlock={(type) => addBlock(type)} />
        </div>
      )}

      <button
        onClick={() => addBlock('paragraph')}
        className="w-full py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        + Add block
      </button>
    </div>
  );
}

function BlockMenu({ onAddBlock }: { onAddBlock: (type: Block['type']) => void }) {
  const blockTypes = [
    { type: 'paragraph' as const, label: 'Text', icon: '📝' },
    { type: 'heading' as const, label: 'Heading', icon: '📰' },
    { type: 'quote' as const, label: 'Quote', icon: '💬' },
    { type: 'list' as const, label: 'List', icon: '📋' },
    { type: 'image' as const, label: 'Image', icon: '🖼️' },
    { type: 'divider' as const, label: 'Divider', icon: '➖' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 min-w-48">
      {blockTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onAddBlock(type)}
          className="flex items-center gap-2 p-2 text-left hover:bg-gray-100 rounded transition-colors"
        >
          <span>{icon}</span>
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
}

function BlockRenderer({ 
  block, 
  updateBlock, 
  deleteBlock 
}: { 
  block: Block;
  updateBlock: (id: string, content: any) => void;
  deleteBlock: (id: string) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !e.currentTarget.textContent?.trim()) {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  switch (block.type) {
    case 'heading':
      return (
        <div className="my-4">
          <select
            value={block.content.level || 2}
            onChange={(e) => updateBlock(block.id, { ...block.content, level: parseInt(e.target.value) })}
            className="text-sm text-gray-500 border-none outline-none mb-2"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            type="text"
            placeholder="Heading"
            value={block.content.text || ''}
            onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
            onKeyDown={handleKeyDown}
            className={`w-full font-bold border-none outline-none ${
              block.content.level === 1 ? 'text-3xl' :
              block.content.level === 2 ? 'text-2xl' : 'text-xl'
            }`}
          />
        </div>
      );

    case 'paragraph':
      return (
        <textarea
          placeholder="Start writing..."
          value={block.content.text || ''}
          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
          onKeyDown={handleKeyDown}
          rows={1}
          className="w-full text-gray-900 border-none outline-none resize-none my-2"
          style={{ minHeight: '1.5rem' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      );

    case 'quote':
      return (
        <div className="my-4 pl-4 border-l-4 border-gray-300">
          <textarea
            placeholder="Quote text..."
            value={block.content.text || ''}
            onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full text-lg italic text-gray-700 border-none outline-none resize-none mb-2"
          />
          <input
            type="text"
            placeholder="Author (optional)"
            value={block.content.author || ''}
            onChange={(e) => updateBlock(block.id, { ...block.content, author: e.target.value })}
            className="w-full text-sm text-gray-500 border-none outline-none"
          />
        </div>
      );

    case 'list':
      return (
        <div className="my-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => updateBlock(block.id, { ...block.content, ordered: false })}
              className={`px-2 py-1 text-xs rounded ${!block.content.ordered ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            >
              Bullet
            </button>
            <button
              onClick={() => updateBlock(block.id, { ...block.content, ordered: true })}
              className={`px-2 py-1 text-xs rounded ${block.content.ordered ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            >
              Numbered
            </button>
          </div>
          {(block.content.items || ['']).map((item: string, index: number) => (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-gray-500 mt-1">
                {block.content.ordered ? `${index + 1}.` : '•'}
              </span>
              <input
                type="text"
                placeholder="List item..."
                value={item}
                onChange={(e) => {
                  const newItems = [...(block.content.items || [''])];
                  newItems[index] = e.target.value;
                  updateBlock(block.id, { ...block.content, items: newItems });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newItems = [...(block.content.items || [''])];
                    newItems.splice(index + 1, 0, '');
                    updateBlock(block.id, { ...block.content, items: newItems });
                  } else if (e.key === 'Backspace' && !item && (block.content.items || []).length > 1) {
                    const newItems = [...(block.content.items || [''])];
                    newItems.splice(index, 1);
                    updateBlock(block.id, { ...block.content, items: newItems });
                  }
                }}
                className="flex-1 border-none outline-none"
              />
            </div>
          ))}
        </div>
      );

    case 'image':
      return (
        <div className="my-4 space-y-2">
          <input
            type="url"
            placeholder="Image URL (e.g. https://...)"
            value={block.content.url || ''}
            onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-gray-600 border border-gray-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {block.content.url && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={block.content.url}
                alt={block.content.title || 'Image'}
                className="w-full max-h-64 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <input
            type="text"
            placeholder="Title (optional)"
            value={block.content.title || ''}
            onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full text-gray-900 border-none outline-none text-lg font-medium"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={block.content.caption || ''}
            onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-gray-500 border-none outline-none"
          />
        </div>
      );

    case 'divider':
      return (
        <div className="my-8 flex justify-center">
          <div className="w-24 h-px bg-gray-300"></div>
        </div>
      );

    default:
      return null;
  }
}
