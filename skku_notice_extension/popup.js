console.log('thisispopup');
//document.getElementById("h1").innerText = "man";

const all_pages = []; // 전체 페이지 배열

/** URL을 통해 해당 페이지 html 가져오기, page = 해당 페이지 */
const getHtml = async (page) => {
    try {
        return await fetch("https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=list&&articleLimit=10&article.offset=" + page)
            .then(response => response.text());
    } catch (error) {
        console.error(error);
    }
};

/** html 파싱하여 데이터 추출하기 , page = 해당 페이지*/
const crawling = async (page) => {
    try {
        const html = await getHtml(page);
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');
        const textarray = doc.querySelectorAll("dt.board-list-content-title > a"); // 제목
        const viewarray = doc.querySelectorAll(".board-mg-l10"); // 조회수
        const datearray = doc.querySelectorAll(".board-list-content-info > ul > li:nth-child(3)"); // 날짜
        console.log('textarray:', textarray);
        for (let i = 0; i < 10; i++) {
            url = textarray[i].href.trim();
            realUrl = url.split("?")[1];
            all_pages.push({
                'title': textarray[i].innerText.trim(),
                'views': +(viewarray[i].innerText.trim()),
                'links': 'https://www.skku.edu/skku/campus/skk_comm/notice01.do?' + realUrl,


                'date': datearray[i].innerText.trim()
            }); // 전체 페이지 배열에 데이터 저장
            console.log(realUrl);
            console.log(all_pages[i].links);
        }
    } catch (error) {
        console.error('Crawling failed:', error);
        throw error; // 에러를 잡아서 로깅 후 다시 throw
    }
};

/** 몇 페이지까지  크롤링? p = 페이지*/
function loop(p) {
    let promises = [];
    for (let i = 0; i < p * 10; i += 10) {
        // crawling 함수가 Promise를 반환한다고 가정
        promises.push(crawling(i));
    }
    return Promise.all(promises);
}
function printTable() {
    const tbody = document.getElementById('tbody');
    for (i = 0; i < all_pages.length; i++) {

        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        let td = document.createElement('td');
        tr.appendChild(td);

        const a = document.createElement('a');
        td.appendChild(a);
        a.href = all_pages[i].links;
        a.target = '_blank';
        a.textContent = all_pages[i].title;

        //td.innerHTML = all_pages[i].title;
        td = document.createElement('td');
        tr.appendChild(td);
        td.innerHTML = all_pages[i].date;
        td = document.createElement('td');
        tr.appendChild(td);
        td.innerHTML = all_pages[i].views;
    };
};
function sortTable(table_id, sortColumn, ascending = true) {
    const tableData = document.getElementById(table_id).getElementsByTagName('tbody').item(0);
    const rowData = tableData.getElementsByTagName('tr');
    for (let i = 0; i < rowData.length - 1; i++) {
        for (let j = 0; j < rowData.length - (i + 1); j++) {
            const value1 = Number(rowData.item(j).getElementsByTagName('td').item(sortColumn).innerHTML.replace(/[^0-9\.]+/g, ""));
            const value2 = Number(rowData.item(j + 1).getElementsByTagName('td').item(sortColumn).innerHTML.replace(/[^0-9\.]+/g, ""));
            if (ascending ? value1 > value2 : value1 < value2) {
                tableData.insertBefore(rowData.item(j + 1), rowData.item(j));
            }
        }
    }
}

// 크롤링 시작
loop(5).then(() => {
    console.log("크롤링 완료");
    console.log(all_pages.length); // 전체 페이지 배열 길이

    // 정렬 로직
    /*
    all_pages.sort(function (a, b) {
        return b.views - a.views;
    });*/
    console.log("정렬 완료");
    console.log(all_pages);

    let ascDate = false;
    let ascViews = false;
    printTable();
    sortTable('data', 2, ascViews);

    document.getElementById('datesort').addEventListener('click', function () {
        sortTable('data', 1, ascDate);  // 'tableId'와 0을 실제 테이블 ID와 열 인덱스로 바꿔야 합니다.
        ascDate = !ascDate;  // 정렬 방향 전환
    });
    document.getElementById('viewsort').addEventListener('click', function () {
        sortTable('data', 2, ascViews);  // 'tableId'와 0을 실제 테이블 ID와 열 인덱스로 바꿔야 합니다.
        ascViews = !ascViews;  // 정렬 방향 전환
    });
    console.log(all_pages[0].links);
});
console.log('finish');

