app.controller('allowancesController', function ($scope, $http) {
    const domain = 'http://localhost:8080';
    $scope.searchAllowance = '';
    $scope.itemsPerPage = 10;
    $scope.allowanceCurrentPage = 1;
    $scope.employeeCurrentPage = 1;
    $scope.selectedEmployeeIds = [];
    $scope.searchEmployee = '';
    $scope.employeeCurrentPage = 1;
    $scope.sortColumn = 'amount'; // Cột mặc định
    $scope.sortReverse = false; // Mặc định là không đảo ngược sắp xếp

    $scope.isEffective = function (endDate) {
        const today = new Date();
        return today <= new Date(endDate);
    };

    $scope.sortData = function (column) {
        if ($scope.sortColumn === column) {
            $scope.sortReverse = !$scope.sortReverse;
        } else {
            $scope.sortColumn = column;
            $scope.sortReverse = false;
        }
        $scope.getAllowances($scope.allowanceCurrentPage); // Lấy lại dữ liệu sau khi sắp xếp
    };

    $scope.getAllowances = function (page) {
        const currentPage = page || $scope.allowanceCurrentPage || 1;
        const keyword = $scope.searchAllowance || ''; // Tìm kiếm theo từ khóa (nếu có)

        const params = {
            page: currentPage - 1, // Trang bắt đầu từ 0 cho backend
            size: $scope.itemsPerPage,
            keyword: keyword,
            sort: `${$scope.sortColumn},${$scope.sortReverse ? 'desc' : 'asc'}` // Thêm tham số sắp xếp
        };

        $http.get(`${domain}/api/allowances`, { params })
            .then(response => {
                $scope.allowances = response.data.content; // Lấy danh sách phụ cấp từ content
                $scope.totalAllowancePages = response.data.totalPages; // Tổng số trang
                $scope.allowanceCurrentPage = currentPage; // Cập nhật trang hiện tại
            })
            .catch(error => console.error("Lỗi không thể tải danh sách phụ cấp: ", error));
    };
    // Hàm lấy danh sách phụ cấp nhân viên
    $scope.getEmployeeAllowances = function (page) {
        const currentPage = page || $scope.allowanceCurrentPage || 1;
        const params = {
            page: currentPage - 1,
            size: $scope.itemsPerPage
        };

        $http.get(`${domain}/api/allowances`, { params })
            .then(response => {
                $scope.employeeAllowances = [];
                response.data.content.forEach(item => {
                    item.employeeallowances.forEach(employeeAllowance => {
                        employeeAllowance.allowanceId = item.id;
                        $scope.employeeAllowances.push(employeeAllowance);
                    });
                });
                $scope.totalEmployeePages = response.data.totalPages;
                $scope.employeeCurrentPage = currentPage;
                $scope.filterEmployeeAllowances(); // Lọc dữ liệu sau khi tải
            })
            .catch(error => console.error("Lỗi không thể tải danh sách nhân viên phụ cấp: ", error));
    };
    $scope.filterEmployeeAllowances = function () {
        // Lọc theo tên nhân viên
        const keyword = $scope.searchEmployee ? $scope.searchEmployee.toLowerCase() : '';
        $scope.filteredEmployeeAllowances = $scope.employeeAllowances.filter(function (allowance) {
            return allowance.employeeID.fullName.toLowerCase().includes(keyword);
        });
    };



    // Hàm chuyển trang
    $scope.changeEmployeePage = function (page) {
        if (page < 1 || page > $scope.totalEmployeePages) return;
        $scope.getEmployeeAllowances(page);
    };


    $scope.changeEmployeePage = function (page) {
        if (page < 1 || page > $scope.totalEmployeePages) return; // Kiểm tra nếu page không hợp lệ
        $scope.employeeCurrentPage = page; // Cập nhật trang hiện tại
        $scope.getEmployeeAllowances(page); // Gọi lại hàm getEmployeeAllowances với trang mới
    };

    // Lấy danh sách nhân viên
    $scope.getEmployees = function () {
        $http.get(`${domain}/api/employees`)
            .then(response => {
                $scope.employees = response.data.content;
            })
            .catch(error => console.error("Lỗi không thể tải danh sách nhân viên: ", error));
    };


    // Khởi tạo controller
    $scope.init = () => {
        $scope.getEmployees();
        $scope.getAllowances();
        $scope.newEmployeeAllownace = {
            employeeIds: [] // Mảng lưu trữ các id nhân viên được chọn
        };
        $scope.selectedEmployeeAllownace = {};
        $scope.selectAllowance = {};
        $scope.newAllowance = {};
        $scope.detailEmployeeAllownace = [];
    };

    // Mở modal thêm nhân viên phụ cấp
    $scope.openAddModal = () => {
        $scope.newEmployeeAllownace = {};
        $('#addModal').modal('show');
    };
    $scope.openDetailModal = (employeeAllowance) => {
        $scope.detailEmployeeAllownace = angular.copy(employeeAllowance);
        $('#detailModal').modal('show');
    };
    // Mở modal cập nhật nhân viên phụ cấp
    $scope.openUpdateModal = (employeeAllowance) => {
        // Sao chép đối tượng
        $scope.selectedEmployeeAllowance = angular.copy(employeeAllowance);

        // Kiểm tra nếu mảng employeeallowances có dữ liệu, chuyển đổi ngày
        if ($scope.selectedEmployeeAllowance.employeeallowances.length > 0) {
            const allowance = $scope.selectedEmployeeAllowance.employeeallowances[0];  // Chỉ lấy phần tử đầu tiên
            if (allowance.startDate) {
                $scope.selectedEmployeeAllowance.startDate = new Date(allowance.startDate);  // Chuyển startDate thành Date object
            }
            if (allowance.endDate) {
                $scope.selectedEmployeeAllowance.endDate = new Date(allowance.endDate);  // Chuyển endDate thành Date object
            }
        }
        // Mở modal
        $('#updateModal').modal('show');
    };


    $scope.toggleEmployeeSelection = function (employeeId) {
        const index = $scope.selectedEmployeeIds.indexOf(employeeId);

        if (index > -1) {
            // Nếu ID đã có trong mảng, xóa nó
            $scope.selectedEmployeeIds.splice(index, 1);
        } else {
            // Nếu ID chưa có, thêm vào mảng
            $scope.selectedEmployeeIds.push(employeeId);
        }
    };

    $scope.toggleEmployeeSelectionupdate = (employeeId) => {
        // Kiểm tra nếu employeeId đã tồn tại trong employeeallowances
        const employeeIndex = $scope.selectedEmployeeAllowance.employeeallowances.findIndex(emp => emp.employeeID.id === employeeId);

        if (employeeIndex === -1) {
            // Nếu không có, thêm vào
            $scope.selectedEmployeeAllowance.employeeallowances.push({
                employeeID: { id: employeeId }  // Giả sử cấu trúc này là đúng
            });
        } else {
            // Nếu có, xóa khỏi mảng
            $scope.selectedEmployeeAllowance.employeeallowances.splice(employeeIndex, 1);
        }

        // Log để kiểm tra
        console.log("Updated employeeallowances:", $scope.selectedEmployeeAllowance.employeeallowances);
    };

    $scope.isEmployeeSelected = (employeeId) => {
        // Kiểm tra xem employeeId có trong danh sách nhân viên đã chọn hay không

        return $scope.selectedEmployeeAllowance && $scope.selectedEmployeeAllowance.employeeallowances.some(emp => emp.employeeID.id === employeeId);
    };

    $scope.addAllowanceEmployee = () => {
        const newEmployeeAllowance = {
            allowanceName: $scope.newEmployeeAllownace.allowanceName,
            amount: $scope.newEmployeeAllownace.amount,
            startDate: $scope.newEmployeeAllownace.startDate.toISOString(),
            endDate: $scope.newEmployeeAllownace.endDate.toISOString(),
            employeeIds: $scope.selectedEmployeeIds
        };

        if (newEmployeeAllowance.startDate > newEmployeeAllowance.endDate) {
            showAlert("Lỗi", "Ngày kết thúc phải lớn hơn ngày bắt đầu", "error");
            return;
        }

        $http.post(`${domain}/api/allowances`, newEmployeeAllowance)
            .then(response => {
                console.log("API Response: ", response);
                showAlert("Thành công", "Thêm phụ cấp cho nhân viên thành công", "success");
                $scope.getAllowances();
                $('#addModal').modal('hide');
            })
            .catch(error => {
                // Log error for debugging
                console.log(error);

                let errorMessage = "Có lỗi xảy ra, vui lòng kiểm tra lại.";

                // Nếu API trả về lỗi chi tiết từ backend
                if (error.data && error.data.message) {
                    errorMessage = error.data.message;
                }
                // Xử lý lỗi từ status code 400 hoặc các lỗi cụ thể khác nếu cần
                else if (error.status === 400 && error.data) {
                    // Kiểm tra lỗi theo các trường hợp cụ thể (ví dụ: trường "allowanceName")
                    if (error.data.allowanceName) {
                        errorMessage = error.data.allowanceName;
                    } else if (error.data.amount) {
                        errorMessage = error.data.amount;
                    } else if (error.data.startDate) {
                        errorMessage = error.data.startDate;
                    } else if (error.data.endDate) {
                        errorMessage = error.data.endDate;
                    }
                    // Bạn có thể thêm các trường hợp lỗi khác tại đây (như 'startDate', 'endDate'...)
                }

                // Hiển thị thông báo lỗi
                showAlert("Lỗi", errorMessage, "error");
            });
    };

    // Cập nhật phụ cấp cho nhân viên
    $scope.updateAllowanceEmployee = () => {
        const employeeIds = $scope.selectedEmployeeAllowance.employeeallowances.map(allowance => allowance.employeeID.id);
        console.log(employeeIds);

        const updateAllowance = {
            allowanceName: $scope.selectedEmployeeAllowance.allowanceName,
            amount: $scope.selectedEmployeeAllowance.amount,
            startDate: $scope.selectedEmployeeAllowance.startDate.toISOString(),
            endDate: $scope.selectedEmployeeAllowance.endDate.toISOString(),
            employeeIds: employeeIds
        }
        console.log(updateAllowance);

        if (updateAllowance.startDate && updateAllowance.endDate) {
            if (updateAllowance.startDate > updateAllowance.endDate) {
                showAlert("Lỗi", "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.", "error");
                return; // Dừng hàm nếu ngày kết thúc không hợp lệ
            }
        }

        // Gửi yêu cầu PUT
        $http.put(`${domain}/api/allowances/` + $scope.selectedEmployeeAllowance.id, updateAllowance)
            .then(response => {
                console.log("API Response: ", response);
                $scope.getAllowances(); // Cập nhật danh sách trợ cấp
                if (response.status === 200) {
                    showAlert("Thành công", "Cập nhật thành công", "success");
                }
                $('#updateModal').modal('hide'); // Đóng modal sau khi cập nhật
            })

            .catch(error => {
                if (error.data && error.data.message && error.data.message.includes("Duplicate entry")) {
                    showAlert("Lỗi", "Nhân viên và phụ cấp đã tồn tại. Vui lòng chọn dữ liệu khác.", "error");
                } else {
                    showAlert("Lỗi", "Lỗi hệ thống: Không thể cập nhật dữ liệu. Vui lòng thử lại sau.", "error");
                }
            });
    };

    $scope.remove = (id) => {
        $http.delete(`${domain}/api/allowances/` + id)
            .then(response => {
                $scope.getAllowances();
                    showAlert("Thành công", "Xóa phụ cấp thành công", "success");
            })
            .catch(error => {
                showAlert("Lỗi", "Lỗi hệ thống: Không thể xóa dữ liệu. Vui lòng thử lại sau.", "error");
                console.log(error)
            });
    }



    function showAlert(title, text, icon) {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
        });
    }

    // Khởi tạo controller
    $scope.init();
});