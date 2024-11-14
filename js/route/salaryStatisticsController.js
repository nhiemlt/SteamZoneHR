app.controller('salaryStatisticsController', function($scope, $http) {
  $scope.employees = []; 
  $scope.fetchAttendanceData = function () {
    const apiUrl = 'http://localhost:8080/api/employees/getSalary';

    $http.get(apiUrl)
        .then(function (response) {
            console.log("Dữ liệu nhận được:", response.data);
            $scope.employees = response.data;
            console.log( $scope.employees);
        })
        .catch(function (error) {
            console.error("Lỗi không có dữ liệu", error);
        });
  };
$scope.fetchAttendanceData();
});
