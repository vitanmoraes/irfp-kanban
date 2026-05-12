import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error('Erro: Faltam variáveis de ambiente (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const KNOWLEDGE_DIR = path.join(process.cwd(), 'public', 'knowledge_md');
const INDEX_PATH = path.join(process.cwd(), 'src', 'data', 'knowledge_index.json');

async function generateEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

function chunkText(text: string, filename: string): { content: string, page: string }[] {
  const chunks: { content: string, page: string }[] = [];
  
  // Primeiro, tentar quebrar por ## Página
  const pages = text.split('## Página ');
  
  pages.forEach((pageContent, idx) => {
    let pageNum = "Início";
    let content = pageContent;
    
    if (idx > 0) {
      const lines = pageContent.split('\n');
      pageNum = lines[0].trim();
      content = lines.slice(1).join('\n');
    }
    
    // Se a página for muito grande, quebrar em blocos de ~1500 chars
    const maxChars = 1500;
    if (content.length > maxChars) {
      const subChunks = content.match(/[\s\S]{1,1500}(?:\n|$)/g) || [content];
      subChunks.forEach(sub => {
        if (sub.trim().length > 50) {
          chunks.push({ content: sub.trim(), page: pageNum });
        }
      });
    } else if (content.trim().length > 50) {
      chunks.push({ content: content.trim(), page: pageNum });
    }
  });
  
  return chunks;
}

async function run() {
  console.log('🚀 Iniciando ingestão da base de conhecimento...');
  
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  
  // Limpar tabela antes de re-popular (opcional, mas recomendado para evitar duplicados)
  console.log('🧹 Limpando dados antigos...');
  await supabase.from('knowledge_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const item of index) {
    const filePath = path.join(KNOWLEDGE_DIR, item.filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Arquivo não encontrado: ${item.filename}`);
      continue;
    }
    
    console.log(`📄 Processando: ${item.title} (${item.filename})...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkText(content, item.filename);
    
    console.log(`   - Gerados ${chunks.length} chunks. Gerando embeddings...`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await generateEmbedding(chunk.content);
        
        const { error } = await supabase.from('knowledge_chunks').insert({
          filename: item.filename,
          title: item.title,
          page: chunk.page,
          content: chunk.content,
          chunk_index: i,
          embedding: embedding
        });
        
        if (error) throw error;
        process.stdout.write('.');
      } catch (err) {
        console.error(`\n❌ Erro no chunk ${i} de ${item.filename}:`, err);
      }
    }
    console.log('\n✅ Concluído.');
  }
  
  console.log('🎉 Ingestão finalizada com sucesso!');
}

run();
