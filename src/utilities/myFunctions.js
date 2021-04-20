
export default {
    globalHelper: function () {
        alert('Hello world');
    },
    scaled: function (valuesArray) {

        const max = Math.max(...valuesArray);
        const min = Math.min(...valuesArray);
        const scaler = function (value) {
            return (value - min) / (max - min);
        }
        return valuesArray.map(d=> scaler(d))

    },
    rowsUnpack: function (jsonRows, key) {
        try {
            return jsonRows.map(function (jsonRow) {
                return jsonRow[key];
            });
        } catch (err) {
            console.log(err);
        }
    },
    sortDataArray: function (dataArray) {
        return dataArray.sort(function (a, b) {
            let aDate = new Date(a[0]);
            let bDate = new Date(b[0]);
            return aDate - bDate;
        });
    },
    zipArrays(a, b) {
        return a.map(function (e, i) {
            return [e, b[i]];
        });
    },
    titleCase(sentence) {
        sentence = sentence.toLowerCase().split('_');
        for (let i = 0; i < sentence.length; i++) {
            sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
        }
        return sentence.join(' ');
    },


};