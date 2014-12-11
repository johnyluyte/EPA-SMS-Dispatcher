// Uses "blob" and "html5 <a download></a> attribute" to perform offline download.
// http://blog.darkthread.net/post-2014-03-12-html5-object-url.aspx
function createDownloadableContent() {
  createDownloadableContentForThisProgram();
  createDownloadableContentFor3FRegion();
  createDownloadableContentFor3FPersonnel();
  /*
  TODO:
    要 Clean blob，避免 memory leak
    a.onclick = function(e) {
      cleanUp(this);
    };
  */
}

function getblobUrl(content) {
  // 利用 blob 轉成可下載的物件。
  var MIME_TYPE = 'text/plain';
  // add UTF-8 BOM header
  var UTF8_BOM = '\uFEFF';
  var blob = new Blob([UTF8_BOM+content], {
    type: MIME_TYPE
  });
  var blobUrl = window.URL.createObjectURL(blob);
  return blobUrl;
}

function setButtonAttribute(buttonID, blobUrl, fileName) {
  var $btn = $('#' + buttonID);
  $btn.attr({
    href: blobUrl,
    download: fileName
  });
}

// 輸出成這個教務組要的格式（依照地區）
function createDownloadableContentFor3FRegion() {
  var content = "";
  var regionDatasLength = regionDatas.length;
  for (var i = 0; i < regionDatasLength; i++) {
    // 此地區此梯次沒有開名額，故可以不顯示此地區
    if (regionDatas[i].available === 0) {
      continue;
    }
    // 地區名稱
    content += regionDatas[i].name + ",";
    // 名額人數
    content += "共" + regionDatas[i].available + "人,";
    // 錄取之學號
    for (var k = 0; k < regionDatas[i].resultArray.length; k++) {
      var student = regionDatas[i].resultArray[k];
      content += student.id + ",";
    }
    content += "\n";
  } // for(var i=0;i<regionDatasLength;i++)

  var blobUrl = getblobUrl(content);
  var fileName = WHAT_T + "T_region.csv";
  setButtonAttribute("btn_downloadCSVRegion", blobUrl, fileName);
}

// 輸出成這個教務組要的格式（依照個人學號）
function createDownloadableContentFor3FPersonnel() {
  // 將目前頁面上的 option select 用 逗號 和 換行 分隔，並存入變數中。
  var content = "";
  for (var i = 1; i <= TOTAL_STUDENT; i++) {
    content += i;
    content += "," + $('#wishList' + i + '_1').val();
    content += "\n";
  }

  var blobUrl = getblobUrl(content);
  var fileName = WHAT_T + "T_personnel.csv";
  setButtonAttribute("btn_downloadCSVPersonnel", blobUrl, fileName);
}


// 輸出成這個程式看得懂的格式
function createDownloadableContentForThisProgram() {
  // 將目前頁面上的 option select 用 逗號 和 換行 分隔，並存入變數中。
  var content = "";
  for (var i = 1; i <= TOTAL_STUDENT; i++) {
    content += i;
    content += "," + $('#score' + i).val();
    for (var k = 0; k <= 1; k++) {
      // wishList%_0 = 戶籍地，wishList%_1 = 第一志願
      content += "," + $('#wishList' + i + '_' + k).val();
    }
    // 加上家因
    if ($('#homeFirst' + i).is(':checked')) {
      content += "," + IS_HOME_FIRST;
    } else {
      content += "," + IS_NOT_HOME_FIRST;
    }
    content += "\n";
  }
  var blobUrl = getblobUrl(content);
  var fileName = getFileName(".txt");
  setButtonAttribute("btn_downloadTXT", blobUrl, fileName);
}


// 指定 目前的日期時間 為 檔案名稱。
function getFileName(suffix) {
  var currentdate = new Date();
  var fileName = "" + currentdate.getFullYear() + fixOneDigit((currentdate.getMonth() + 1)) + fixOneDigit(currentdate.getDate()) + "_" + fixOneDigit(currentdate.getHours()) + fixOneDigit(currentdate.getMinutes()) + fixOneDigit(currentdate.getSeconds()) + suffix;
  return fileName;
}

// 如果現在時間是 2014/11/1, 21:07, 02
// 可能我們會得到 2014111_2172
// 而我們想要的是 20141101_210702 才對
// 這個 function 可以 fix 上述問題。
function fixOneDigit(x) {
  var result = x;
  if (result < 10) {
    result = "0" + result;
  }
  return result;
}
