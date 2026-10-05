(function(){
  function buildInput({query='',barcode='',imageDataUrl='',country='EG'}={}){
    const input={country};
    if(String(barcode).trim()) input.barcode=String(barcode).replace(/\s+/g,'').trim();
    else if(String(imageDataUrl).trim()) input.image_data_url=String(imageDataUrl);
    else if(String(query).trim()) input.query=String(query).trim();
    else throw new Error('INPUT_REQUIRED');
    return input;
  }
  window.AskBuyV50Input={buildInput};
})();
