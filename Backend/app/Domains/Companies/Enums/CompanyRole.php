<?php  

namespace App\Domains\Companies\Enums;

enum CompanyRole: string 
{
    case OWNER = 'OWNER';
    case ADMIN = 'ADMIN';
    case EMPLOYEE = 'EMPLOYEE';

}