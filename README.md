# EPA SMS Dispatcher

This is a simple system for [Environmental Protection Agency](http://www.epa.gov.tw/mp.asp) to dispatch its [Substitute Military Service](https://en.wikipedia.org/wiki/Alternative_civilian_service) personnel.

Although this system is designed for EPA, it can be easily modified to fit other departments as well.


## Usage

To be updated.


## Offline Version

The EPA SMS Dispatcher was originally designed to work offline.
The **offline version** uses HTML and javascripts only and does not need Internet connection.
It can work on any browsers and any computers.

However, the **offline version** cannot save data.
It means that the user has to download current data to his or her computer, and load it from the browser next time. The data is convert and saved in a txt file.
**Please [make sure the input file is encoded with UTF-8 (without BOM)](http://wen198599.pixnet.net/blog/post/22314819-%5B%E5%BC%95%E7%94%A8%5Dexcel%E9%96%8B%E5%95%9Fcsv%E6%AA%94%E7%9A%84%E8%8A%B1%E5%BC%8F%E6%8A%80%E5%B7%A7)**

This should not be a big problem to most users.
But some employees may not be so familiar with **offline webpages**.
That's where the online version shows up.

(Actually, the offilne version can save data in the browser's storage. But most employees prefer txt files.)


## Online Version

To be updated.


## Todo Lists

- 增加 “全部清除” 按鈕 (F5)
- 原本的下載功能是利用 blob 將純文字轉成可下載的物件，此過程暫時稱為 convert，我們原本為 convert 設立一個獨立的按鈕，按下該按鈕後，才會在跑出另一個 download 按鈕，download 按鈕才會真正將轉換後的 blob 下載到使用者端。
- 為了讓操作更簡化，我們將 convert 的功能以及 download 按鈕的產生 併入開始預排按鈕內，也就是說，現在只要按下開始預排按鈕，就會自動執行 convert，並產生 download 按鈕，如此一來，algo result -> convert -> downloadable 的流程一定不會有錯，對使用者來說也很直覺。

- 要印給輔導組，照號碼排

- 123456789123
- 裝 firefox, notepad++, D碟不會自動回復

- Tutorial pages with screenshots
- Chrome modification.
  - https://stackoverflow.com/questions/2541949/problems-with-jquery-getjson-using-local-files-in-chrome
  - MAC: open /Applications/Google\ Chrome.app --args --allow-file-access-from-files
  - http://eureka.ykyuen.info/2013/09/24/chrome-bypass-access-control-allow-origin-on-local-file-system/

- Online version.
- Online version should only accepct password request from accounts with @apa.gov.tw suffix


## License

This project is licensed under the terms of the [MIT license](http://opensource.org/licenses/MIT).

Please note that this project is built with materials from the following parties:

- [Bootstrap](http://getbootstrap.com/)
- [flatly](http://bootswatch.com/flatly/)
- [jQuery](https://jquery.com/)

Please also refer to their Licenses for further information.

