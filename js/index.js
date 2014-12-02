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
    TOTAL_STUDENT = data.total_students;
    var list = data.regionLists;
    for(var i=0;i<list.length;i++){
      var regionData = new RegionData();
      regionData.id = list[i].id;
      regionData.name = list[i].name;
      regionData.homeName = list[i].homeName;
      regionData.shortName = list[i].shortName;
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
  initBtnLoadFromFile(); // 初始化讀取按鈕
  initBtnStartAlgo(); // 初始化預排按鈕
  window.onbeforeunload = confirmOnPageExit; // 確認是否關閉瀏覽器，防止誤觸關閉瀏覽器。
}


// 印出 0-10號 10-20號 20-30號 那個 nav-tabs。
function createWishListsNavTabs(){
  // 依照學生人數調整 nav-tabs 的 tab 數量
  var string = '<ul class="nav nav-tabs">';
  string += '<li class="active"><a href="#wishList10" data-toggle="tab">1-10 號</a></li>';
  for(var i=20;i<(TOTAL_STUDENT+10);i+=10){
    string += '<li><a href="#wishList' + i + '" data-toggle="tab">'+(i-9)+'-'+i+' 號</a></li>';
  }
  string += '</ul>';
  string += '<div id="myTabContent" class="tab-content">';

  // 依照學生人數調整 tab-pane 的數量
  string += '<div class="tab-pane fade active in" id="wishList10">';
  string += createWishListsTab(10) + '</div>';
  for(var i=20;i<(TOTAL_STUDENT+10);i+=10){
    string += '<div class="tab-pane fade in" id="wishList' + i + '">';
    string += createWishListsTab(i) + '</div>';
  }

  string += '</div>';
  $("#div_wishLists").append(string);
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
    // 是否為家因的 check box，從 1 號 N 號依序為 homeFirst1 ~ homeFirstN
    string += '<td><input type="checkbox" id="homeFirst' + i + '" value="">優先</td></tr>';
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
