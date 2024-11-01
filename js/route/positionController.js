angular.module('app').controller('positionController', function ($scope, $http) {
    // Khởi tạo dữ liệu
    $scope.positions = []; // Danh sách chức vụ
    $scope.departments = []; // Danh sách phòng ban
    $scope.newDepartment = {}; // Dữ liệu phòng ban mới
    $scope.selectedDepartment = null; // Phòng ban đang được chọn
    $scope.newPosition = {}; // Dữ liệu chức vụ mới
    $scope.selectedPosition = null; // Chức vụ đang được chọn

    // Hàm lấy tất cả phòng ban
    $scope.loadDepartments = function () {
        $http.get('http://localhost:8080/api/PositionDepartment/getAll')
            .then(function (response) {
                $scope.departments = response.data; // Cập nhật danh sách phòng ban
                console.log($scope.departments);
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm lấy tất cả chức vụ
    $scope.loadPositions = function () {
        $http.get('http://localhost:8080/api/position')
            .then(function (response) {
                $scope.positions = response.data; // Cập nhật danh sách chức vụ
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm thêm phòng ban
    $scope.addDepartment = function () {
        $http.post('http://localhost:8080/api/PositionDepartment/add-position-department', $scope.newDepartment)
            .then(function (response) {
                $scope.departments.push(response.data); // Thêm phòng ban mới vào danh sách
                $scope.clearNewDepartment(); // Reset form
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm cập nhật phòng ban
    $scope.updateDepartment = function () {
        if ($scope.selectedDepartment) {
            $http.put(`http://localhost:8080/api/PositionDepartment/update-position-department/${$scope.selectedDepartment.id}`, $scope.selectedDepartment)
                .then(function (response) {
                    const index = $scope.departments.findIndex(department => department.id === response.data.id);
                    if (index !== -1) {
                        $scope.departments[index] = response.data; // Cập nhật danh sách
                    }
                    $scope.selectedDepartment = null; // Reset lựa chọn
                })
                .catch(function (error) {
                    console.error('Lỗi API:', error); // Xử lý lỗi
                });
        }
    };

    // Hàm thêm chức vụ
    $scope.addPosition = function () {
        $http.post('http://localhost:8080/api/position', $scope.newPosition)
            .then(function (response) {
                $scope.positions.push(response.data); // Thêm chức vụ mới vào danh sách
                $scope.clearNewPosition(); // Reset form
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm cập nhật chức vụ
    $scope.updatePosition = function () {
        if ($scope.selectedPosition) {
            $http.put(`http://localhost:8080/api/position/${$scope.selectedPosition.id}`, $scope.selectedPosition)
                .then(function (response) {
                    const index = $scope.positions.findIndex(position => position.id === response.data.id);
                    if (index !== -1) {
                        $scope.positions[index] = response.data; // Cập nhật danh sách
                    }
                    $scope.selectedPosition = null; // Reset lựa chọn
                })
                .catch(function (error) {
                    console.error('Lỗi API:', error); // Xử lý lỗi
                });
        }
    };

    // Hàm xóa phòng ban
    $scope.deleteDepartment = function (departmentId) {
        $http.delete(`http://localhost:8080/api/PositionDepartment/${departmentId}`)
            .then(function () {
                $scope.loadDepartments(); // Tải lại danh sách sau khi xóa
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm xóa chức vụ
    $scope.deletePosition = function (positionId) {
        $http.delete(`http://localhost:8080/api/position/${positionId}`)
            .then(function () {
                $scope.loadPositions(); // Tải lại danh sách sau khi xóa
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm làm mới thông tin phòng ban
    $scope.clearNewDepartment = function () {
        $scope.newDepartment = {}; // Reset thông tin phòng ban mới
    };

    // Hàm làm mới thông tin chức vụ
    $scope.clearNewPosition = function () {
        $scope.newPosition = {}; // Reset thông tin chức vụ mới
    };

    // Gọi các hàm để tải dữ liệu khi controller khởi tạo
    $scope.loadDepartments();   
    $scope.loadPositions(); 
});
