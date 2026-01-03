/**
 * SESMine Platform - Admin Content Management
 * Handles products, articles, and media management
 * Version: 1.0.0
 */

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
  products: 'sesmine_products',
  articles: 'sesmine_articles',
  media: 'sesmine_media'
};

// ==================== PRODUCT MANAGEMENT ====================

/**
 * Load all products
 */
function loadProducts() {
  const products = getAllProducts();
  const grid = document.getElementById('productsGrid');
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-box-open text-6xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">No products yet. Create your first product!</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <div class="content-card bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      ${product.image ? `
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
      ` : `
        <div class="w-full h-48 bg-slate-800 flex items-center justify-center">
          <i class="fas fa-image text-4xl text-gray-600"></i>
        </div>
      `}
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-lg mb-1">${product.name}</h3>
            <span class="text-xs px-2 py-1 rounded-full ${
              product.type === 'free' ? 'bg-green-500/20 text-green-500' :
              product.type === 'premium' ? 'bg-amber-500/20 text-amber-500' :
              'bg-purple-500/20 text-purple-500'
            }">${product.type}</span>
          </div>
          <div class="flex items-center gap-2">
            ${product.active ? 
              '<i class="fas fa-check-circle text-green-500"></i>' : 
              '<i class="fas fa-times-circle text-gray-500"></i>'
            }
          </div>
        </div>
        <p class="text-gray-400 text-sm mb-4 line-clamp-2">${product.description}</p>
        <div class="flex items-center justify-between text-sm mb-4">
          <span class="text-gray-400">
            <i class="fas fa-folder mr-1"></i>${product.category}
          </span>
          <span class="font-bold text-purple-500">
            ${product.price > 0 ? `$${product.price}/${product.period}` : 'Free'}
          </span>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="editProduct('${product.id}')"
            class="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-semibold transition-all"
          >
            <i class="fas fa-edit mr-1"></i>Edit
          </button>
          <button 
            onclick="deleteProduct('${product.id}')"
            class="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 py-2 rounded-lg font-semibold transition-all"
          >
            <i class="fas fa-trash mr-1"></i>Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Get all products from storage
 */
function getAllProducts() {
  try {
    const products = localStorage.getItem(STORAGE_KEYS.products);
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

/**
 * Open product modal
 */
function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('productModalTitle');
  
  // Reset form
  form.reset();
  document.getElementById('productActive').checked = true;
  
  if (productId) {
    // Edit mode
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
      title.textContent = 'Edit Product';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productType').value = product.type;
      document.getElementById('productDescription').value = product.description;
      document.getElementById('productFeatures').value = product.features ? product.features.join('\n') : '';
      document.getElementById('productPrice').value = product.price || '';
      document.getElementById('productDiscount').value = product.discount || '';
      document.getElementById('productPeriod').value = product.period || 'one-time';
      document.getElementById('productImage').value = product.image || '';
      document.getElementById('productUrl').value = product.url || '';
      document.getElementById('productActive').checked = product.active !== false;
    }
  } else {
    // Create mode
    title.textContent = 'Add New Product';
    document.getElementById('productId').value = '';
  }
  
  modal.classList.remove('hidden');
}

/**
 * Close product modal
 */
function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}

/**
 * Save product
 */
function saveProduct(event) {
  event.preventDefault();
  
  const productId = document.getElementById('productId').value;
  const productData = {
    id: productId || 'prod_' + Date.now(),
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    type: document.getElementById('productType').value,
    description: document.getElementById('productDescription').value,
    features: document.getElementById('productFeatures').value.split('\n').filter(f => f.trim()),
    price: parseFloat(document.getElementById('productPrice').value) || 0,
    discount: parseInt(document.getElementById('productDiscount').value) || 0,
    period: document.getElementById('productPeriod').value,
    image: document.getElementById('productImage').value,
    url: document.getElementById('productUrl').value,
    active: document.getElementById('productActive').checked,
    createdAt: productId ? undefined : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  let products = getAllProducts();
  
  if (productId) {
    // Update existing
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
    }
  } else {
    // Add new
    products.push(productData);
  }
  
  // Save to storage
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  
  // Show success message
  showNotification(
    productId ? 'Product updated successfully!' : 'Product created successfully!',
    'success'
  );
  
  // Reload and close
  loadProducts();
  closeProductModal();
}

/**
 * Edit product
 */
function editProduct(productId) {
  openProductModal(productId);
}

/**
 * Delete product
 */
function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }
  
  let products = getAllProducts();
  products = products.filter(p => p.id !== productId);
  
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  
  showNotification('Product deleted successfully!', 'success');
  loadProducts();
}

// ==================== ARTICLE MANAGEMENT ====================

/**
 * Load all articles
 */
function loadArticles() {
  const articles = getAllArticles();
  const grid = document.getElementById('articlesGrid');
  
  if (articles.length === 0) {
    grid.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-newspaper text-6xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">No articles yet. Create your first article!</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = articles.map(article => `
    <div class="content-card bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div class="flex items-start gap-4">
        ${article.image ? `
          <img src="${article.image}" alt="${article.title}" class="w-32 h-32 object-cover rounded-xl">
        ` : `
          <div class="w-32 h-32 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <i class="fas fa-image text-3xl text-gray-600"></i>
          </div>
        `}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <h3 class="font-bold text-lg mb-1">${article.title}</h3>
              <div class="flex items-center gap-3 text-sm text-gray-400 mb-2">
                <span><i class="fas fa-user mr-1"></i>${article.author}</span>
                <span><i class="fas fa-calendar mr-1"></i>${formatDate(article.publishDate, 'short')}</span>
                <span class="px-2 py-1 rounded-full text-xs ${
                  article.status === 'published' ? 'bg-green-500/20 text-green-500' :
                  article.status === 'scheduled' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-gray-500/20 text-gray-400'
                }">${article.status}</span>
              </div>
            </div>
            ${article.featured ? '<i class="fas fa-star text-amber-500 text-xl"></i>' : ''}
          </div>
          <p class="text-gray-400 text-sm mb-3 line-clamp-2">${article.excerpt}</p>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full">
              <i class="fas fa-folder mr-1"></i>${article.category}
            </span>
            ${article.tags ? article.tags.split(',').slice(0, 3).map(tag => `
              <span class="text-xs px-2 py-1 bg-slate-800 text-gray-400 rounded-full">
                #${tag.trim()}
              </span>
            `).join('') : ''}
          </div>
          <div class="flex gap-2">
            <button 
              onclick="editArticle('${article.id}')"
              class="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <i class="fas fa-edit mr-1"></i>Edit
            </button>
            <button 
              onclick="viewArticle('${article.id}')"
              class="bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <i class="fas fa-eye mr-1"></i>View
            </button>
            <button 
              onclick="deleteArticle('${article.id}')"
              class="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <i class="fas fa-trash mr-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Get all articles from storage
 */
function getAllArticles() {
  try {
    const articles = localStorage.getItem(STORAGE_KEYS.articles);
    return articles ? JSON.parse(articles) : [];
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

/**
 * Open article modal
 */
function openArticleModal(articleId = null) {
  const modal = document.getElementById('articleModal');
  const form = document.getElementById('articleForm');
  const title = document.getElementById('articleModalTitle');
  
  // Reset form
  form.reset();
  
  // Set default publish date
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('articlePublishDate').value = now.toISOString().slice(0, 16);
  
  if (articleId) {
    // Edit mode
    const articles = getAllArticles();
    const article = articles.find(a => a.id === articleId);
    
    if (article) {
      title.textContent = 'Edit Article';
      document.getElementById('articleId').value = article.id;
      document.getElementById('articleTitle').value = article.title;
      document.getElementById('articleCategory').value = article.category;
      document.getElementById('articleAuthor').value = article.author;
      document.getElementById('articleExcerpt').value = article.excerpt;
      document.getElementById('articleContent').value = article.content;
      document.getElementById('articleImage').value = article.image || '';
      document.getElementById('articleTags').value = article.tags || '';
      document.getElementById('articlePublishDate').value = article.publishDate ? new Date(article.publishDate).toISOString().slice(0, 16) : '';
      document.getElementById('articleStatus').value = article.status;
      document.getElementById('articleFeatured').checked = article.featured || false;
    }
  } else {
    // Create mode
    title.textContent = 'Add New Article';
    document.getElementById('articleId').value = '';
    const user = getCurrentUser();
    if (user) {
      document.getElementById('articleAuthor').value = user.name;
    }
  }
  
  modal.classList.remove('hidden');
}

/**
 * Close article modal
 */
function closeArticleModal() {
  document.getElementById('articleModal').classList.add('hidden');
}

/**
 * Save article
 */
function saveArticle(event, forceDraft = false) {
  event.preventDefault();
  
  const articleId = document.getElementById('articleId').value;
  const articleData = {
    id: articleId || 'article_' + Date.now(),
    title: document.getElementById('articleTitle').value,
    category: document.getElementById('articleCategory').value,
    author: document.getElementById('articleAuthor').value,
    excerpt: document.getElementById('articleExcerpt').value,
    content: document.getElementById('articleContent').value,
    image: document.getElementById('articleImage').value,
    tags: document.getElementById('articleTags').value,
    publishDate: document.getElementById('articlePublishDate').value,
    status: forceDraft ? 'draft' : document.getElementById('articleStatus').value,
    featured: document.getElementById('articleFeatured').checked,
    createdAt: articleId ? undefined : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  let articles = getAllArticles();
  
  if (articleId) {
    // Update existing
    const index = articles.findIndex(a => a.id === articleId);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...articleData };
    }
  } else {
    // Add new
    articles.push(articleData);
  }
  
  // Save to storage
  localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(articles));
  
  // Show success message
  showNotification(
    articleId ? 'Article updated successfully!' : 'Article created successfully!',
    'success'
  );
  
  // Reload and close
  loadArticles();
  closeArticleModal();
}

/**
 * Edit article
 */
function editArticle(articleId) {
  openArticleModal(articleId);
}

/**
 * View article
 */
function viewArticle(articleId) {
  const articles = getAllArticles();
  const article = articles.find(a => a.id === articleId);
  
  if (article) {
    // Open in new window/tab
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${article.title}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          img { max-width: 100%; height: auto; }
          h1 { color: #333; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${article.title}</h1>
        <div class="meta">
          By ${article.author} | ${formatDate(article.publishDate, 'long')} | ${article.category}
        </div>
        ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
        <p><strong>${article.excerpt}</strong></p>
        <div>${article.content.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `);
  }
}

/**
 * Delete article
 */
function deleteArticle(articleId) {
  if (!confirm('Are you sure you want to delete this article?')) {
    return;
  }
  
  let articles = getAllArticles();
  articles = articles.filter(a => a.id !== articleId);
  
  localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(articles));
  
  showNotification('Article deleted successfully!', 'success');
  loadArticles();
}

// ==================== MEDIA MANAGEMENT ====================

/**
 * Load media library
 */
function loadMedia() {
  const media = getAllMedia();
  const grid = document.getElementById('mediaGrid');
  
  if (media.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-images text-6xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">No media files yet. Upload your first file!</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = media.map(item => `
    <div class="content-card bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group relative">
      <div class="aspect-square bg-slate-800 flex items-center justify-center">
        ${item.type === 'image' ? `
          <img src="${item.url}" alt="${item.name}" class="w-full h-full object-cover">
        ` : `
          <i class="fas fa-file text-4xl text-gray-600"></i>
        `}
      </div>
      <div class="p-3">
        <p class="text-sm font-semibold truncate">${item.name}</p>
        <p class="text-xs text-gray-400">${item.size}</p>
      </div>
      <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button 
          onclick="copyMediaUrl('${item.url}')"
          class="bg-purple-500 hover:bg-purple-600 p-3 rounded-lg transition-all"
          title="Copy URL"
        >
          <i class="fas fa-copy"></i>
        </button>
        <button 
          onclick="deleteMedia('${item.id}')"
          class="bg-red-500 hover:bg-red-600 p-3 rounded-lg transition-all"
          title="Delete"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Get all media from storage
 */
function getAllMedia() {
  try {
    const media = localStorage.getItem(STORAGE_KEYS.media);
    return media ? JSON.parse(media) : [];
  } catch (error) {
    console.error('Error loading media:', error);
    return [];
  }
}

/**
 * Open media upload modal
 */
function openMediaUpload() {
  document.getElementById('mediaModal').classList.remove('hidden');
}

/**
 * Close media modal
 */
function closeMediaModal() {
  document.getElementById('mediaModal').classList.add('hidden');
  document.getElementById('uploadProgress').classList.add('hidden');
}

/**
 * Handle file upload
 */
function handleFileUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  const progressDiv = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('uploadBar');
  const progressPercent = document.getElementById('uploadPercent');
  
  progressDiv.classList.remove('hidden');
  
  // Simulate upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = progress + '%';
    progressPercent.textContent = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      
      // Save media files
      Array.from(files).forEach(file => {
        const mediaItem = {
          id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          size: formatFileSize(file.size),
          url: URL.createObjectURL(file), // In production, upload to server
          uploadedAt: new Date().toISOString()
        };
        
        let media = getAllMedia();
        media.push(mediaItem);
        localStorage.setItem(STORAGE_KEYS.media, JSON.stringify(media));
      });
      
      showNotification('Files uploaded successfully!', 'success');
      loadMedia();
      
      setTimeout(() => {
        closeMediaModal();
      }, 1000);
    }
  }, 200);
}

/**
 * Copy media URL to clipboard
 */
function copyMediaUrl(url) {
  copyToClipboard(url);
}

/**
 * Delete media
 */
function deleteMedia(mediaId) {
  if (!confirm('Are you sure you want to delete this media file?')) {
    return;
  }
  
  let media = getAllMedia();
  media = media.filter(m => m.id !== mediaId);
  
  localStorage.setItem(STORAGE_KEYS.media, JSON.stringify(media));
  
  showNotification('Media deleted successfully!', 'success');
  loadMedia();
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== SEARCH FUNCTIONALITY ====================

// Search products
document.getElementById('searchProducts')?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const products = getAllProducts();
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.description.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm)
  );
  
  // Update display with filtered products
  // Implementation similar to loadProducts()
});

// Search articles
document.getElementById('searchArticles')?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const articles = getAllArticles();
  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm) ||
    a.excerpt.toLowerCase().includes(searchTerm) ||
    a.author.toLowerCase().includes(searchTerm)
  );
  
  // Update display with filtered articles
  // Implementation similar to loadArticles()
});
