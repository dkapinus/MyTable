import React, {useEffect,useCallback, useState} from 'react';
import {Button, Form, Input, InputNumber, Modal, Space, Table} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

type UserRecord = {
    key: string;
    dateTime: string;
    name: string;
    age: number;
};


export const MyTable = () => {

    const [dataSource, setDataSource] = useState<UserRecord[]>([
        { key: '1', dateTime: '1990-10-22', name: 'Mike', age: 32 },
        { key: '2', dateTime: '1996-07-01', name: 'John', age: 42 },
        { key: '3', dateTime: '2010-08-10', name: 'Bob', age: 89 },
        { key: '4', dateTime: '1989-08-10', name: 'Mari', age: 9 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);


    const [isModalOpen, setIsModalOpen] = useState(false);




    const [editingRecord, setEditingRecord] = useState<UserRecord>();
    const [form] = Form.useForm();




    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };


    const filtered = dataSource.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleEdit = (record: UserRecord) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (key: string) => {
        const updated = dataSource.filter(item => item.key !== key);
        setDataSource(updated);
        handleSearch(searchTerm); // обновить фильтр после удаления
    };

    const handleUpdate = () => {
        form.validateFields().then(values => {
            const updatedRecord = { ...editingRecord, ...values } as UserRecord;
            if (editingRecord) {
                const updated = dataSource.map(item =>
                    item.key === editingRecord.key ? updatedRecord : item
                );
                setDataSource(updated);
            } else {
                const newKey = Date.now().toString();
                setDataSource([...dataSource, { key: newKey, ...values }]);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingRecord(undefined);
            handleSearch(searchTerm);
        });
    };

    const isFormChanged = useCallback(() => {
        const current = form.getFieldsValue();

        if (!editingRecord) {
            return Object.values(current).every(val => val !== undefined && val !== '');
        }

        return Object.entries(current).some(([key, value]) => {
            return editingRecord.hasOwnProperty(key) && value !== editingRecord[key as keyof UserRecord];
        });
    }, [form, editingRecord]);


    useEffect(() => {
        if (isModalOpen) {
            const hasErrors = form.getFieldsError().some(f => f.errors.length > 0);
            const changed = isFormChanged();
            setIsDisabled(hasErrors || !changed);
        }
    }, [form, isFormChanged, isModalOpen]);



    const columns = [
        {
            title: 'Date',
            dataIndex: 'dateTime',
            key: 'dateTime',
            sorter:  (a:any, b:any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter:  (a:any, b:any) => a.name.localeCompare(b.name),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            sorter: (a: UserRecord, b: UserRecord) => a.age - b.age,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: ( record: UserRecord) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />}  onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.key)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];
    return (
        <div>
            <Space style={{ marginBottom: '16px' }}>
                <Input.Search
                    placeholder="Поиск по таблице"
                    allowClear
                    onSearch={handleSearch}
                    onChange={e => handleSearch(e.target.value)}
                    value={searchTerm}
                />
                <Button
                    type="primary"
                    onClick={() => {
                        setEditingRecord(undefined);
                        form.resetFields();
                        setIsModalOpen(true);
                        setIsDisabled(true);
                    }}

                >
                    Добавить пользователя
                </Button>
            </Space>

            <Table dataSource={filtered}
                   columns={columns}
            />

            <Modal
                title={editingRecord ? "Редактировать пользователя" : "Добавить пользователя"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleUpdate}
                okText="Сохранить"
                cancelText="Отмена"
                okButtonProps={{ disabled: isDisabled }}

            >
                <Form form={form} layout="vertical"
                      onFieldsChange={() => {
                          const hasErrors = form.getFieldsError().some(f => f.errors.length > 0);
                          const changed = isFormChanged();
                          setIsDisabled(hasErrors || !changed);
                      }}

                >

                    <Form.Item name="name" label="Имя"
                               getValueFromEvent={(e) => e.target.value.trim()}
                               rules={[
                                   {
                                       validator(_, value) {
                                           if (!value) return Promise.reject('Введите имя');
                                           const trimmed = value.trim();
                                           if (trimmed.length > 20) return Promise.reject('Максимум 20 символов');
                                           if (!/^[-A-Za-zА-Яа-яЁё]{1,20}$/.test(trimmed)) {
                                               return Promise.reject('Только буквы и дефис');
                                           }
                                           return Promise.resolve();
                                       },
                                   },
                               ]}>
                        <Input maxLength={21}/>
                    </Form.Item>
                    <Form.Item name="age" label="Возраст" rules={[
                        { required: true, message: 'Введите возраст' },
                        { type: 'number', min: 0, max: 100, message: 'Возраст должен быть от 0 до 100' },
                    ]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="dateTime" label="Дата рождения" rules={[{ required: true, message: 'Введите дату рождения' }]}>
                        <Input type="date" max={new Date().toISOString().split('T')[0]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

