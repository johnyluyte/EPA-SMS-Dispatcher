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
      if(student.homeFirst == true){
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
      tableScripts += "<b>" + student.id + "</b>";
      tableScripts += "<span class='scoreFont'>(" + student.score + ")  </span></font>";
      if((++count) % printRound_N == 0){
        tableScripts += "<br/>";
      }
    }
    // 未錄取的學號(淡藍色+刪節線)
    tableScripts += "<font color='" + fontColors.typeKicked + "'>"
    for(var k=0;k<regionDatas[i].queue.length;k++){
      tableScripts += "<s>" + regionDatas[i].queue[k].id + "</s>";
      tableScripts += "<span class='scoreFont'>(" + regionDatas[i].queue[k].score + ")  </span>";
    }
    tableScripts += "</font></td></tr>"


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
    });
  }
}


// 按下號碼後，算出此號碼還可以搶的贏的地區，顯示出來
function findResolution(printToDivID, id){
  var str = '<div class="div_findResolution">';
  str += '<span style="color:purple">（' + id + '號）</span>可選擇：';

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
