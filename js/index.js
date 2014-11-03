// 確認是否關閉瀏覽器，防止誤觸關閉瀏覽器。
var confirmOnPageExit = function (e) 
{
  // If we haven't been passed the event get the window.event
  e = e || window.event;
  var message = 'Any text will block the navigation and display a prompt';
  // For IE6-8 and Firefox prior to version 4
  if (e) 
  {
    e.returnValue = message;
  }
  // For Chrome, Safari, IE8+ and Opera 12+
  return message;
};



$(function(){
  loadJSON();
});


function loadJSON(){
  $.getJSON(JSON_FILE_NAME, function(data) {
    // Assign json contents to Global variable "regionDatas".
    var list = data.regionLists;
    for(var i=0;i<list.length;i++){
      var regionData = new RegionData();
      regionData.name = list[i].name;
      regionData.shortName = list[i].shortName;
      regionData.homeName = list[i].homeName;
      regionData.available = list[i].available;
      regionData.queue = new Array();
      regionData.resultArray = new Array();
      // Add to array
      regionDatas[i] = regionData;
    }
    afterLoadJSON();
  })
  .error(function() {
    alert("Error loading JSON_FILE_NAME:" + JSON_FILE_NAME ); 
  });
}


// 這些函式會用到 regionDatas[]，而 regionDatas[] 的資料來源為 JSON，故必須在 JSON 讀取完後才能執行。
function afterLoadJSON(){
  createWishListsNavTabs(); // 佈置版面
  initBtnSaveTofile(); // 下載按鈕
  initBtnLoadFromFile(); // 讀取按鈕
  initBtnStartAlgo(); // 預排按鈕
  window.onbeforeunload = confirmOnPageExit; // 確認是否關閉瀏覽器，防止誤觸關閉瀏覽器。
}


// 印出 0-10號 10-20號 20-30號 那個 nav-tabs。
function createWishListsNavTabs(){
  // TODO: 這裏改成 for 迴圈，並能依照 TOTAL_STUDENT 來判斷要加多少 tab。
  var string = "";
  string += '<ul class="nav nav-tabs">';
  string += '<li class="active"><a href="#wishList10" data-toggle="tab">1-10 號</a></li>';
  string += '<li class=""><a href="#wishList20" data-toggle="tab">11-20 號</a></li>';
  string += '<li class=""><a href="#wishList30" data-toggle="tab">21-30 號</a></li>';
  string += '<li class=""><a href="#wishList40" data-toggle="tab">31-40 號</a></li>';
  string += '<li class=""><a href="#wishList50" data-toggle="tab">41-50 號</a></li>';
  string += '<li class=""><a href="#wishList60" data-toggle="tab">51-60 號</a></li>';
  string += '<li class=""><a href="#wishList70" data-toggle="tab">61-70 號</a></li>';
  string += '<li class=""><a href="#wishListSetting" data-toggle="tab">設定</a></li>';
  string += '</ul>';
  string += '<div id="myTabContent" class="tab-content">';
  string += '<div class="tab-pane fade active in" id="wishList10">';
  string += createWishListsTab(10);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishList20">';
  string += createWishListsTab(20);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishList30">';
  string += createWishListsTab(30);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishList40">';
  string += createWishListsTab(40);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishList50">';
  string += createWishListsTab(50);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishList60">';
  string += createWishListsTab(60);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishList70">';
  string += createWishListsTab(70);
  string += '</div>';
  string += '<div class="tab-pane fade in" id="wishListSetting">';
  string += createWishListsSetting();
  string += '</div>';
  string += '</div>';
  
  $("#div_wishLists").append(string); 
}

function createWishListsSetting(){
  var string = '';
  string += 'explain name, homeName, shortName <br/>';
  string += '<input type="checkbox" name="aa" value="" >"分發結果(依個人)" 的縣市名稱使用縮寫。</br>';
  string += '可設定 printRound_N';
  string += '沒收人的單位是否不顯示在 round 結果';
  return string;
}

// 印出 學號 戶籍地 分數 志願一二三 的那整張表格。
function createWishListsTab(studentIdBegin){
  var string = '<table class="table table-striped table-hover">';
  string += '<thead><tr><td>學號</td><td>戶籍地</td><td>分數</td><td>志願</td><td>家因</td></tr></thead><tbody>';

  for(var i=studentIdBegin-9;i<=studentIdBegin;i++){
    if(i>TOTAL_STUDENT){
      break;
    }
    string += '<tr><td>'+ i + '</td>';
    string += '<td>'+ addSelectTable(i,0) + '</td>'; 
    string += '<td>'+ '<input class="score" id="score'+ i + '" value="0" />' + '</td>';
    string += '<td>'+ addSelectTable(i,1) + '</td>';
    string += '<td><input type="checkbox" name="homeFirst" value="homeFirst" >優先</td></tr>';
  }
  string += '</tbody></table>';

  return string;
}


// parameter studentID:從 1 到 TOTAL_STUDENT，注意不是從 0，是從 1
// parameter wishList:0為戶籍地、123依序為志願一二三
// parameter <select> 的 id 會以 wishList1_0 ~ wishList1_3 , wishList60_0 ~ wishList60_3 的方式呈現
function addSelectTable(studentID, wishList){
  var tmp = '<select ';
  if(wishList==0){
    // tmp += ' disabled ';
  }
  tmp += 'data-placeholder="--" style="width: 180px" class="chosen-select" tabindex="-1"';
  tmp += 'id="wishList'+ studentID + '_' + wishList +'" >';
  tmp += '<option selected="" value="none">無</option>';

  for(var i=0;i<regionDatas.length;i++){
    // 戶籍地跳過中央單位，因為中央單位不可能為戶籍地
    if(wishList==0 && i<4){
      continue;
    }else if(i==0){
      tmp += '<option disabled="">==中央單位==</option>';  
    }
    if(i==4){
      tmp += '<option disabled="">==北部==</option>';    
    }else if(i==10){
      tmp += '<option disabled="">==中部==</option>';
    }else if(i==14){
      tmp += '<option disabled="">==南部==</option>';
    }else if(i==21){
      tmp += '<option disabled="">==東部==</option>';
    }else if(i==24){
      tmp += '<option disabled="">==外島==</option>';
    }

    if(wishList==0){
      // 戶籍地的話就用簡寫名稱。（花蓮縣）
      tmp += '<option value="' + regionDatas[i].homeName + '">';
      tmp += regionDatas[i].homeName + '</option>';
    }else{
      // 分發地區的話就用單位全名。（花蓮縣政府環保局）
      tmp += '<option ';
      if(regionDatas[i].available==0){
        tmp += ' disabled';
      }
      tmp += ' value="' + regionDatas[i].name + '">';
      tmp += regionDatas[i].name + '</option>';
    }
  }
  tmp += '</select>';

  return tmp;
}
