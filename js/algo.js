function initBtnStartAlgo(){
  $('#btn_startDispatch').bind('click', function(event) {
    event.preventDefault();
    initAlgo();
    createResultPanel("div_resultPanel");
    doRound();
    printRound("resultRegion");
    printResultPersonal("resultPersonal");
  });
}


// 初始化變數、將 html 清空
function initAlgo(){
  students = new Array();
  avgScore = 0.0;
  for(x in regionDatas){
    regionDatas[x].queue = new Array();
    regionDatas[x].resultArray = new Array();
  }

  for(var i=1;i<=TOTAL_STUDENT;i++){
    var student = new Student();
    student.id = i;
    student.score = $('#score'+i).val();
    student.home = $('#wishList'+i+'_0').val();
    student.wish1 = $('#wishList'+i+'_1').val();
    student.result = NO_REGION_RESULT;
    student.homeFirst = $('#homeFirst'+i).is(':checked');
    // Add to lists
    students[i-1] = student;
    // parserInt() used to cause lost of digits. Fixed: 2014, Oct 29
    avgScore += parseFloat(student.score);
  }
  avgScore = avgScore/TOTAL_STUDENT;
  var size = Math.pow(10, 2);
  avgScore = Math.round(avgScore * size) / size;
}


// 畫出 平均分數、Round1、Round2、Round3、分發結果(依個人)的那個 nav-tabs
function createResultPanel(printToDivID){
  var str = '<div class="panel panel-info">';
  str += '<div class="panel-heading">';
  str += '<h3 class="panel-title">分配結果(平均分數：'+avgScore+')</h3>';
  str += '</div>';
  str += '<div class="panel-body" id="div_dispatchResult">';
  str += '<ul class="nav nav-tabs">';
  str += '<li class="active"><a href="#resultRegion" data-toggle="tab">地區</a></li>';
  str += '<li><a href="#resultPersonal" data-toggle="tab">個人</a></li>';
    // color block 色塊
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.typeHome + ';"></canvas> 家因</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type1 + ';"></canvas> 高均+戶籍</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type2 + ';"></canvas> 高均+非戶籍</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type3 + ';"></canvas> 低均+戶籍地</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.type4 + ';"></canvas> 低均+非戶籍</li>';
  str += '<li><canvas width="13" height="13" class="colorBlock" style="background:' + fontColors.typeKicked + ';"></canvas> 被擠掉</li>';
  // 

  str += '</ul>';
  str += '<div id="resultTabContent" class="tab-content">';
  str += '  <div class="tab-pane fade active in" id="resultRegion"></div>';
  str += '  <div class="tab-pane fade" id="resultPersonal"></div>';
  str += '</div>';
  str += '</div></div>';
  $("#"+printToDivID).html(str);
}


// 將 分發規則 用演算法實作
function doRound(){
  // 可以清空 queue，因為我們可以直接從 student.result 的內容來找出還沒被分發的學生，送進下一 round
  for(var i=0;i<regionDatas.length;i++){
    regionDatas[i].queue = new Array();
  }

  // Step 1: 將學生加入其第N志願的 queue (N depend on round)
  var regionDatasLength = regionDatas.length;
  for(var k=0;k<TOTAL_STUDENT;k++){
    // 如果學生已經分發到某的地點，就不須再分發，可跳過直接看下個學生。
    if(students[k].result != NO_REGION_RESULT){
      continue;
    }
    // TODO: 這邊改用 key hash 應該會漂亮、效能也更好
    for(var i=0;i<regionDatasLength;i++){
      if(students[k].wish1 == regionDatas[i].name){
        regionDatas[i].queue.push(students[k]);
      }
    }
  }

  // Step 2: 將每個單位的 queue 裡面的學生互相比較，取出最適合此單位的學生放入此單位的 resultArray
  for(var i=0;i<regionDatasLength;i++){
    var region = regionDatas[i];

    // 此單位名額已經滿，跳過
    if(region.resultArray.length == region.available){
      continue;
    }
    
    // 要去的人數 小於等於 開放的名額，每個人都錄取
    else if(region.queue.length <= region.available){
      // 其實可以不用排序，但是排序之後印出來比較好看
      region.queue.sort(function(a, b){return a.score-b.score});    
      popItemFromQueueAndPushToResultArray(region, region.queue.length);
    }

    // 要去的人數 大於 開放的名額，依照 分發規則 找出最適合此單位的學生放入此單位的 resultArray
    else{
      // 不管是中央還是地方，都要比較成績，所以先依照成績排序
      region.queue.sort(function(a, b){return a.score-b.score});    
      // 依照成績排序後是"由小到大"，亦即 [30分, 40分, 60分, 90分, 100分]
      // 考慮到之後的 Array.pop() 是 pop 出"最後一個"物件，這樣排列比較方便之後的處理
      cruelFunction(i, region);
    }
  }
}


// This function is so cruel that I cannot even look at it.
function cruelFunction(regionID, region){
  if(regionID<=3){
    // 中央只有比成績，不考慮戶籍地，因此可直接依成績排序找出錄取的學生
    popItemFromQueueAndPushToResultArray(region, region.available);
  }else{
    // 地方單位在依照成績排序後，再把 "過均標" 且 "符合戶籍地" 的往前排
    // 剛剛已經過成績順序了，現在要分別對“過均標”跟“沒過均標”的做戶籍地優先的排序
    region.queue.sort(function(a, b){
      if((a.score >= avgScore && b.score >= avgScore) || (a.score < avgScore && b.score < avgScore)){
        if(a.home == region.homeName && b.home != region.homeName){
          return 1;
        }else if(b.home == region.homeName && a.home != region.homeName){
          return -1;
        }
      }
      return 0;
    });
    // 接下來，把家因的抓出來，要優先分發，所以丟到 queue 最後面。（等等 pop()時會變成最前面 ）
    region.queue.sort(function(a, b){
      if(a.homeFirst==true){
        return 1;
      }
      return 0;
    });
    // 排完後再依照順序找出錄取的學生
    popItemFromQueueAndPushToResultArray(region, region.available);
  }
}


// 從 region 的排序過後的 queue 裡面，抓出 numberOfItems 個學生，丟進 resultArray 裡面
function popItemFromQueueAndPushToResultArray(region, numberOfItems){
  for(var k=0;k<numberOfItems;k++){
    region.resultArray.push(region.queue.pop());
  }
  assignStudentToRegion(region.homeName, region.resultArray);   
}


// 將已經被分配到某地區的學生的 result attribute 指定為該地區。(resultArray[] 的 items 為學生，擁有 result )
function assignStudentToRegion(regionName, resultArray){
  var length = resultArray.length;
  for(var i=0;i<length;i++){
    resultArray[i].result = regionName;
  }
}


// 印出每個 round 的資訊
function printRound(printToDivID){
  var tableScripts = "";
  tableScripts += '<div class="row"><div class="col-md-6">';
  tableScripts += '<table class="table table-striped table-hover">';
  tableScripts += '<thead><tr><td>地區</td><td>名額</td><td>學號</td></tr></thead><tbody>';
  var regionDatasLength = regionDatas.length;
  for(var i=0;i<regionDatasLength;i++){
    // 此地區此梯次沒有開名額，故可以不顯示此地區
    if(regionDatas[i].available==0){
      continue;
    }

    // 地區名稱
    tableScripts += "<tr><td>" + regionDatas[i].shortName   + "</td>";
    
    // 名額人數(紅色:溢出、藍色:短缺)
    tableScripts += "<td>" + "<font color='black'>" + regionDatas[i].available + "</font>";
    if(regionDatas[i].queue.length > 0){
      tableScripts += "<font color='" + fontColors.overheat + "'> +" + regionDatas[i].queue.length + "</font>";
    }else if(regionDatas[i].resultArray.length < regionDatas[i].available){
      tableScripts += "<font color='" + fontColors.shortage + "'> -" + parseInt(regionDatas[i].available - regionDatas[i].resultArray.length) + "</font>";
    } 
    
    // 錄取的學號(顏色請參考 global.js 的 fontColors)
    tableScripts += "</td><td>";
    // 用 count 來紀錄，每 (global.js的)printRound_N 個人就換下一行。用來平衡版面。
    var count = 0;
    for(var k=0;k<regionDatas[i].resultArray.length;k++){
      var student = regionDatas[i].resultArray[k];
      if(student.homeFirst == true && student.home == regionDatas[i].homeName){
          tableScripts += "<font color=" + fontColors.typeHome + ">"; // 家因
      }
      else if(student.score >= avgScore){
        if(student.home == regionDatas[i].homeName){
          tableScripts += "<font color=" + fontColors.type1 + ">";
        }else{
          tableScripts += "<font color=" + fontColors.type2 + ">";          
        }
      }else{
        if(student.home == regionDatas[i].homeName){
          tableScripts += "<font color=" + fontColors.type3 + ">";
        }else{
          tableScripts += "<font color=" + fontColors.type4 + ">";          
        }        
      }
      tableScripts += "<b>" + student.id + "</b>" + "(" + student.score + ")" + "  </font>";
      if((++count) % printRound_N == 0){
        tableScripts += "<br/>";
      }
    }
    // 未錄取的學號(淡藍色+刪節線)
    tableScripts += "<font color='" + fontColors.typeKicked + "'><s>"
    for(var k=0;k<regionDatas[i].queue.length;k++){
      tableScripts += regionDatas[i].queue[k].id + "(" + regionDatas[i].queue[k].score + ")" + "  ";
    }
    tableScripts += "</s></font></td></tr>"    


    if(i==11){ // (total = 26, 26/2 = 13, 13-1 = 12, 故選 i==12，但連江基本上不開缺，且本署通常開很多缺，故選 i==11)
      // 換行，也就是換另一張表格，一樣使用 col-md-6
      tableScripts += '</tbody></table></div><div class="col-md-6"><table class="table table-striped table-hover">';
      tableScripts += '<thead><tr><td>地區</td><td>名額</td><td>學號</td></tr></thead><tbody>';
    }
  } // for(var i=0;i<regionDatasLength;i++)

  tableScripts += "</tbody></table></div></div>";
  $("#"+printToDivID).append(tableScripts);
  tableScripts = null;

  var leftOverQueue = new Array();
  for(var k=0;k<TOTAL_STUDENT;k++){
    if(students[k].result == NO_REGION_RESULT){
      leftOverQueue.push(students[k].id);
    }
  }

  var str = "本回合結束後，尚未分配到服勤單位的學號: <font color=' " + fontColors.leftOver + " '>";
  var queueLength = leftOverQueue.length;
  for(var k=0;k<queueLength;k++){
    str += "<span class='leftOverStudents' id='leftOverId" + leftOverQueue[k] + "'>" + leftOverQueue[k] + "</span>";
    str += "  ";
  }
  str += "</font>";
  str += "<div id='divFindResolution'></div>";
  $("#"+printToDivID).append(str);

  initLeftOverOnClick(queueLength,leftOverQueue);
}


function initLeftOverOnClick(queueLength,leftOverQueue){
  for(var i=0;i<queueLength;i++){
    var id = leftOverQueue[i]; 
    $("#leftOverId" + id).click(function(){
      findResolution("divFindResolution", $(this).html().toString());
      // $("#autoFindResolution").append("<p>This is " + $(this).html() + "</p>");
    });
  }
}

// 按下號碼後，算出此號碼還可以搶的贏的地區，顯示出來
function findResolution(printToDivID, id){
  var str = '<div class="alert alert-dismissable alert-success"><button type="button" class="close" data-dismiss="alert">×</button>';
  str += '[' + id + '號可選擇] ';

  // 將此 id 的學生抓出來，複製一份
  var student = new Student();
  student.id = students[id-1].id;
  student.score = students[id-1].score;
  student.homeFirst = students[id-1].homeFirst;

  var regionDatasLength = regionDatas.length;
  for(var i=0;i<regionDatasLength;i++){
    var region = regionDatas[i];
    // 該地區沒開放名額，跳過
    if(region.available==0){
      continue;
    }
    // 地區名額小於目前錄取人數，可直接視為可搶贏
    else if(region.resultArray.length < region.available){
      str += region.shortName + " ";
      continue;
    }

    // 地區名額大於目前錄取人數，需要排序看看誰可以錄取
    // 將此 student 丟進該地區的 queue，並排序
    // 若排序完成後此 student 不在這個 queue 的 "最後"，表示此 student 可以錄取此地區，列出此地區
    // The slice() operation clones the array and returns the reference to the new array
    var tempQueue = region.resultArray.slice();
    tempQueue.push(student);
    tempQueue.sort(function(a, b){return a.score-b.score}); 

    if(region.id<=3){
      // 中央只有比成績，不考慮戶籍地
      if(tempQueue[0].id != id){
        str += region.shortName + " ";
      }
    }
    else{
      // 地方單位在依照成績排序後，再把 "過均標" 且 "符合戶籍地" 的往前排
      // 剛剛已經過成績順序了，現在要分別對“過均標”跟“沒過均標”的做戶籍地優先的排序
      tempQueue.sort(function(a, b){
        if((a.score >= avgScore && b.score >= avgScore) || (a.score < avgScore && b.score < avgScore)){
          if(a.home == region.homeName && b.home != region.homeName){
            return 1;
          }else if(b.home == region.homeName && a.home != region.homeName){
           return -1;
          }
       }
        return 0;
      });
      // 接下來，把家因的抓出來，要優先分發，所以丟到 queue 最後面。（等等 pop()時會變成最前面 ）
      tempQueue.sort(function(a, b){
       if(a.homeFirst==true){
         return 1;
       }
        return 0;
      });

      if(tempQueue[0].id != id){
        str += region.shortName + " ";
      } 
    }
  } // for(var i=0;i<regionDatasLength;i++)

  str += '</div>';
  $("#"+printToDivID).html(str);
}


// 印出 分發結果(依照個人)
function printResultPersonal(printToDivID){
  var tableScripts = '<div class="row"><div class="col-md-2"><table class="table table-striped table-hover">';
  tableScripts += '<thead><tr><td>學號</td><td>分發</td></tr></thead><tbody>';

  var studentsLength = students.length;
  for(var i=1;i<=studentsLength;i++){
    tableScripts += "<tr><td>" + i + "</td>";
    var result = students[i-1].result;
    if(result == NO_REGION_RESULT){
      tableScripts += "<td><font color='red'>" + result + "</font></td></tr>";
    }else{
      tableScripts += "<td>" + result + "</td></tr>";
    }

    if(i==studentsLength){
      break; // 印完惹
    }else if(i%10 == 0){
      tableScripts += '</tbody></table></div><div class="col-md-2"><table class="table table-striped table-hover">';
      tableScripts += '<thead><tr><td>學號</td><td>分發</td></tr></thead><tbody>';
    }
  }
  tableScripts += "</tbody></table></div></div>";
  $("#"+printToDivID).append(tableScripts);
}
