// Reusable creation function for a simple searchable single-select
(function(){
  function createCustomSelect(root){
    const box = root.querySelector('.select-box');
    const optionsContainer = root.querySelector('.options-container');
    const searchInput = root.querySelector('.search-input');
    const options = Array.from(root.querySelectorAll('.option'));
    const hidden = root.querySelector('input[type="hidden"]');
    const label = root.querySelector('.select-label');
    const clearBtn = root.querySelector('.clear-btn');

    let open = false;
    let highlightIndex = -1;

    function openDropdown(){
      optionsContainer.classList.add('open');
      root.setAttribute('aria-expanded','true');
      open = true;
      searchInput.focus();
      highlightIndex = -1;
      updateHighlights();
    }
    function closeDropdown(){
      optionsContainer.classList.remove('open');
      root.setAttribute('aria-expanded','false');
      open = false;
      searchInput.value = '';
      filterOptions('');
    }

    function toggleDropdown(){ open? closeDropdown() : openDropdown(); }

    function filterOptions(q){
      const val = q.trim().toLowerCase();
      let visible = 0;
      options.forEach((opt, i) => {
        const text = opt.textContent.toLowerCase();
        if(!val || text.includes(val)){
          opt.classList.remove('hidden');
          visible++;
        } else {
          opt.classList.add('hidden');
        }
      });
      // reset highlight if none visible
      if(visible === 0) highlightIndex = -1;
    }

    function updateHighlights(){
      options.forEach((opt, i) => {
        opt.classList.toggle('highlight', i === highlightIndex);
      });
    }

    function selectOption(opt){
      const value = opt.dataset.value ?? opt.textContent.trim();
      hidden.value = value;
      label.textContent = opt.textContent.trim();
      label.classList.remove('select-placeholder');
      clearBtn.style.display = 'inline-block';
      document.getElementById('selected-output').textContent = hidden.value;
      closeDropdown();
    }

    // events
    box.addEventListener('click', (e)=>{ e.stopPropagation(); toggleDropdown(); });
    clearBtn.addEventListener('click', (e)=>{ e.stopPropagation(); hidden.value = ''; label.textContent = 'Select a country...'; label.classList.add('select-placeholder'); clearBtn.style.display = 'none'; document.getElementById('selected-output').textContent = '(none)'; });

    searchInput.addEventListener('input', (e)=>{ filterOptions(e.target.value); highlightIndex = -1; updateHighlights(); });

    options.forEach((opt,i)=>{
      opt.addEventListener('click', (e)=>{ e.stopPropagation(); selectOption(opt); });
    });

    // keyboard handling on the root so arrow keys work when focused
    root.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        if(!open) return openDropdown();
        const visibleOpts = options.filter(o => !o.classList.contains('hidden'));
        if(visibleOpts.length === 0) return;
        highlightIndex = (highlightIndex + 1) % visibleOpts.length;
        // map highlighted index to actual option index
        const highlighted = visibleOpts[highlightIndex];
        options.forEach(o => o.classList.remove('highlight'));
        highlighted.classList.add('highlight');
        highlighted.scrollIntoView({block:'nearest'});
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        if(!open) return openDropdown();
        const visibleOpts = options.filter(o => !o.classList.contains('hidden'));
        if(visibleOpts.length === 0) return;
        highlightIndex = (highlightIndex - 1 + visibleOpts.length) % visibleOpts.length;
        const highlighted = visibleOpts[highlightIndex];
        options.forEach(o => o.classList.remove('highlight'));
        highlighted.classList.add('highlight');
        highlighted.scrollIntoView({block:'nearest'});
      } else if(e.key === 'Enter'){
        e.preventDefault();
        if(open){
          const visibleOpts = options.filter(o => !o.classList.contains('hidden'));
          if(highlightIndex >=0 && visibleOpts[highlightIndex]){
            selectOption(visibleOpts[highlightIndex]);
          } else if(visibleOpts.length === 1){
            selectOption(visibleOpts[0]);
          }
        } else {
          openDropdown();
        }
      } else if(e.key === 'Escape'){
        if(open) closeDropdown();
      } else {
        // if user types, focus the search input to capture letters
        if(e.key.length === 1){
          if(!open) openDropdown();
          searchInput.focus();
        }
      }
    });

    // close when clicking outside
    document.addEventListener('click', (e)=>{ if(!root.contains(e.target)) closeDropdown(); });

  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    const select = document.getElementById('country-select');
    createCustomSelect(select);
  });
})();